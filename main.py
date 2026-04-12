from pathlib import Path
from datetime import datetime
import sys
import os
import json
from google import genai
from google.genai import types
import re
import time
import threading

project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from prompt import PROMPT
from libs.libfile import get_content, read_json, write_json, write_to_file
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

class RateLimiter:
    """Simple mutex-based rate limiter in Requests Per Minute (RPM).

    Usage: create RateLimiter(rpm) and call `wait()` before each request.
    """
    def __init__(self, rpm: int = 60):
        self.rpm = max(1, int(rpm))
        self.min_interval = 60.0 / self.rpm
        self.lock = threading.Lock()
        self.last = 0.0

    def wait(self) -> None:
        with self.lock:
            now = time.monotonic()
            elapsed = now - self.last
            to_wait = self.min_interval - elapsed
            if to_wait > 0:
                time.sleep(to_wait)
                now = time.monotonic()
            self.last = now

if __name__ == "__main__":
  client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

  # Rate limit configuration (requests per minute). Set via env var REQUESTS_PER_MINUTE.
  try:
    REQUESTS_PER_MINUTE = int(os.getenv('REQUESTS_PER_MINUTE', '12'))
  except Exception:
    REQUESTS_PER_MINUTE = 12

  rate_limiter = RateLimiter(REQUESTS_PER_MINUTE)
  for gemma_model in ["gemma-4-26b-a4b-it","gemma-4-31b-it"]:
    print(f"=== STARTING EVALUATION WITH MODEL {gemma_model} ===")
    data = smartbugs_prompt()
    summarized_results = []
    print(f"Total prompts to process: {len(data['prompts'])}\n")
    for idx, current_prompt in enumerate(data["prompts"]):
      prompt_text = current_prompt["content"] if isinstance(current_prompt, dict) else current_prompt
      log_file = Path(data["outlogs"]) / f"{datetime.now().strftime('%H%M%S')}_{current_prompt.get('org_file_path').replace('/', '-') if isinstance(current_prompt, dict) else 'prompt'}.json"

      config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(include_thoughts=True),
            temperature=0,
        )
      
      # Ensure we respect RPM limits before making the API call
      rate_limiter.wait()

      response = client.models.generate_content(
        model= gemma_model, #"gemma-4-31b-it", #"gemini-2.5-flash",
        contents=prompt_text,
        config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
          include_thoughts=True,
        ),
        temperature=0,
      ))
      # 3. Lưu log JSON
      write_json(log_file, response.model_dump())

      
      pred_output = {
        "dataset_name": current_prompt.get("dataset_name", "unknown"),
        "org_file_path": current_prompt.get("org_file_path"),
        "processed_file_path": current_prompt.get("processed_file_path"),
        "vulnerabilities": current_prompt.get("vulnerabilities", []),
        "predicted_vulnerabilities": [],
        "reasoning": [],
        "log_file": "",
      }
      
      for part in response.candidates[0].content.parts:
        if not part.text:
          continue
        if part.thought:
          print(f"--- INTERNAL REASONING ---")
          print("Thought summary:\n")
          print("\n")
          print()
          pred_output["reasoning"].append(part.text)

        else:
          print(f"--- OUTPUT ---")
          print("Answer\n")
          print("\n")
          print()
          processed_answer = parse_json_answer(part.text)
          pred_output["predicted_vulnerabilities"].extend(processed_answer.get("vulnerabilities", []))

      # Lưu kết quả dự đoán ra file JSON
      result_file = log_file.with_name(log_file.stem + "_result.json")
      pred_output["log_file"] = str(result_file)
      write_json(result_file, pred_output)
      print(f"Saved prediction result to {result_file}\n")
      print(f"--- END OF PROMPT {idx + 1}/{len(data['prompts'])} ---\n\n")

      summarized_results.append(str(result_file))
    write_json(Path(data["outlogs"]) / "summary" / f"{datetime.now().strftime('%H%M%S')}.json", summarized_results)
    print(f"=== FINISHED EVALUATION WITH MODEL {gemma_model} ===\n\n")