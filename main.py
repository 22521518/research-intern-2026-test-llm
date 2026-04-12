from pathlib import Path
from datetime import datetime
import sys
import os
import json
from google import genai
from google.genai import types
import re
import threading

project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from prompt import PROMPT
from libs.libfile import get_content, read_json, write_json, write_to_file
from libs.google_ai_request_queue import GoogleAIRequestQueue
from preprocess.smc_preprocess import OUTPUT_ANNOTATION_FILE as SMC_ANNOTATION_FILE, get_vulnerability_categories as get_smartbugs_vulnerability_categories

# If you use a .env file, python-dotenv will load it here. If python-dotenv
# isn't installed that's fine - os.environ will still be used.
try:
  from dotenv import load_dotenv
  load_dotenv()
except Exception:
  pass

OUTPUT_LOG_DIR = project_root / "log"

def get_smartbugs_curated_vulnerabilities() -> list[dict]:
  # annotations file is JSON; read and parse it
  return read_json(SMC_ANNOTATION_FILE)

def smartbugs_prompt() -> dict:
  dataset_name = "smartbugs-curated"
  outlogs = OUTPUT_LOG_DIR / dataset_name / get_timestamp()
  vulnerabilities = get_smartbugs_curated_vulnerabilities()
  prompts = []
  for vulnerability in vulnerabilities:
    log_file = Path(outlogs) / f"{datetime.now().strftime('%H%M%S')}_{vulnerability.get('org_file_path').replace('/', '-')}.json"
    prompt_text = PROMPT.format(
        CONTRACT_CODE=get_content(vulnerability["processed_file_path"]),
        VULNERABILITY_LIST=parse_set_to_string(get_smartbugs_vulnerability_categories())
    )
    prompts.append({
        "dataset_name": dataset_name,
        "vulnerabilities": vulnerability.get("vulnerabilities", []),
        "content": prompt_text,
        "org_file_path": vulnerability.get("org_file_path"),
        "processed_file_path": vulnerability.get("processed_file_path"),
        "log_file": log_file,
    })
  return {"prompts": prompts, "outlogs": outlogs}


def parse_set_to_string(s: set[str]) -> str:
    return ', '.join(sorted(s))

def get_timestamp() -> str:
    """Tạo chuỗi thời gian để đặt tên file."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def parse_json_answer(json_str: str) -> dict:
    if not json_str:
        return {"error": "empty_response"}

    # Thử parse thẳng trước
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fence: ```json ... ``` hoặc ``` ... ```
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", json_str)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except json.JSONDecodeError:
            pass

    # Trích xuất substring từ { đầu tiên đến } cuối cùng
    start = json_str.find("{")
    end   = json_str.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = json_str[start : end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            return {
                "error":     "invalid_json_after_extraction",
                "details":   str(e),
                "candidate": candidate,
            }

    return {"error": "no_json_object_found"}

def get_env_int(name: str, default: int, minimum: int = 1) -> int:
  raw = os.getenv(name, str(default))
  try:
    value = int(raw)
  except Exception:
    value = default
  return max(minimum, value)


def build_log_file(outlogs: Path, prompt_idx: int, org_file_path: str | None) -> Path:
  safe_name = (org_file_path or f"prompt-{prompt_idx}").replace("/", "-").replace("\\", "-")
  safe_name = re.sub(r"[^a-zA-Z0-9._-]+", "-", safe_name).strip("-")
  if not safe_name:
    safe_name = f"prompt-{prompt_idx}"
  return Path(outlogs) / f"{datetime.now().strftime('%H%M%S_%f')}_{prompt_idx:05d}_{safe_name}.json"

def main():
  api_key = os.getenv('GOOGLE_API_KEY')
  if not api_key:
    raise RuntimeError("GOOGLE_API_KEY is not set")

  requests_per_minute = get_env_int('REQUESTS_PER_MINUTE', 12, 1)
  max_in_flight_requests = get_env_int('MAX_IN_FLIGHT_REQUESTS', 4, 1)

  print(
    f"Queue config: REQUESTS_PER_MINUTE={requests_per_minute}, "
    f"MAX_IN_FLIGHT_REQUESTS={max_in_flight_requests}"
  )

  for gemma_model in ["gemma-4-26b-a4b-it","gemma-4-31b-it"]:
    print(f"=== STARTING EVALUATION WITH MODEL {gemma_model} ===")
    data = smartbugs_prompt()
    total_prompts = len(data["prompts"])
    print(f"Total prompts to process: {total_prompts}\\n")

    request_queue: GoogleAIRequestQueue[tuple[int, dict]] = GoogleAIRequestQueue(
      max_in_flight=max_in_flight_requests,
      requests_per_minute=requests_per_minute,
    )

    for idx, current_prompt in enumerate(data["prompts"], start=1):
      if isinstance(current_prompt, dict):
        request_queue.put((idx, current_prompt))
      else:
        request_queue.put((idx, {"content": str(current_prompt)}))
    request_queue.close()

    result_by_index: dict[int, str] = {}
    results_lock = threading.Lock()
    progress_lock = threading.Lock()
    progress = {"done": 0}

    worker_count = max_in_flight_requests

    def worker(worker_id: int) -> None:
      worker_client = genai.Client(api_key=api_key)
      while True:
        task = request_queue.take_ready(timeout=1.0)
        if task is None:
          stats = request_queue.stats()
          if stats.closed and stats.pending == 0:
            break
          continue

        prompt_idx, current_prompt = task
        log_file = build_log_file(
          outlogs=Path(data["outlogs"]),
          prompt_idx=prompt_idx,
          org_file_path=current_prompt.get("org_file_path"),
        )

        pred_output = {
          "dataset_name": current_prompt.get("dataset_name", "unknown"),
          "org_file_path": current_prompt.get("org_file_path"),
          "processed_file_path": current_prompt.get("processed_file_path"),
          "vulnerabilities": current_prompt.get("vulnerabilities", []),
          "predicted_vulnerabilities": [],
          "reasoning": [],
          "log_file": "",
          "error": None,
        }

        try:
          response = worker_client.models.generate_content(
            model=gemma_model,
            contents=current_prompt["content"],
            config=types.GenerateContentConfig(
              thinking_config=types.ThinkingConfig(
                include_thoughts=True,
              ),
              temperature=0,
            ),
          )

          write_json(log_file, response.model_dump())

          if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
              part_text = getattr(part, "text", None)
              if not part_text:
                continue

              if getattr(part, "thought", False):
                pred_output["reasoning"].append(part_text)
              else:
                processed_answer = parse_json_answer(part_text)
                predicted = processed_answer.get("vulnerabilities", [])
                if isinstance(predicted, list):
                  pred_output["predicted_vulnerabilities"].extend(predicted)

        except Exception as e:
          pred_output["error"] = str(e)

        finally:
          try:
            result_file = log_file.with_name(log_file.stem + "_result.json")
            pred_output["log_file"] = str(result_file)
            write_json(result_file, pred_output)

            with results_lock:
              result_by_index[prompt_idx] = str(result_file)
          except Exception as result_write_error:
            print(f"Failed to write result for prompt #{prompt_idx}: {result_write_error}")
          finally:
            in_flight_now = request_queue.mark_done()
            with progress_lock:
              progress["done"] += 1
              done_now = progress["done"]
            print(
              f"[{gemma_model}] worker-{worker_id} finished "
              f"{done_now}/{total_prompts} | in_flight={in_flight_now}"
            )

    workers = []
    for worker_id in range(1, worker_count + 1):
      thread = threading.Thread(target=worker, args=(worker_id,), daemon=True)
      workers.append(thread)
      thread.start()

    for thread in workers:
      thread.join()

    summarized_results = [result_by_index[i] for i in sorted(result_by_index)]
    write_json(Path(data["outlogs"]) / "summary" / f"{datetime.now().strftime('%H%M%S')}.json", summarized_results)
    print(f"=== FINISHED EVALUATION WITH MODEL {gemma_model} ===\n\n")

if __name__ == "__main__":
  main()