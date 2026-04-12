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
from preprocess.smc_preprocess import OUTPUT_ANNOTATION_FILE as SMC_ANNOTATION_FILE

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

OUTPUT_LOG_DIR = project_root / "log"


def get_smartbugs_curated_vulnerabilities(runtime_root: Path | None = None) -> list[dict]:
    if runtime_root is not None:
        runtime_annotation = runtime_root / "data" / SMC_ANNOTATION_FILE.name
        if runtime_annotation.exists():
            return read_json(str(runtime_annotation))
    return read_json(str(SMC_ANNOTATION_FILE))


def resolve_runtime_path(path_value: str, runtime_root: Path) -> Path:
    normalized = str(path_value).strip().replace("\\", "/")
    if not normalized:
        raise ValueError("path_value must not be empty")

    candidates: list[Path] = []
    as_path = Path(normalized)
    if as_path.is_absolute():
        candidates.append(as_path)
    else:
        candidates.append((runtime_root / as_path).resolve())
        candidates.append((project_root / as_path).resolve())
        candidates.append((Path.cwd() / as_path).resolve())

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[0]


def smartbugs_prompt(runtime_root: Path | None = None) -> dict:
    effective_root = runtime_root or project_root
    dataset_name = "smartbugs-curated"
    outlogs = effective_root / "log" / dataset_name / get_timestamp()
    vulnerabilities = get_smartbugs_curated_vulnerabilities(effective_root)
    vulnerability_categories = get_vulnerability_categories_from_annotations(vulnerabilities)
    if not vulnerability_categories:
        raise ValueError("No vulnerability categories found in annotation file")

    prompts = []
    for vulnerability in vulnerabilities:
        resolved_processed_path = resolve_runtime_path(
            vulnerability["processed_file_path"], effective_root
        )
        if not resolved_processed_path.exists():
            raise FileNotFoundError(
                f"Missing processed file: {vulnerability['processed_file_path']} "
                f"-> {resolved_processed_path}"
            )

        prompt_text = PROMPT.format(
            CONTRACT_CODE=get_content(str(resolved_processed_path)),
            VULNERABILITY_LIST=parse_set_to_string(vulnerability_categories),
        )
        prompts.append({
            "dataset_name": dataset_name,
            "vulnerabilities": vulnerability.get("vulnerabilities", []),
            "content": prompt_text,
            "org_file_path": vulnerability.get("org_file_path"),
            "processed_file_path": str(resolved_processed_path),
        })
    return {"prompts": prompts, "outlogs": outlogs}


def parse_set_to_string(s: set[str]) -> str:
    return ", ".join(sorted(s))


def get_vulnerability_categories_from_annotations(annotations: list[dict]) -> set[str]:
    categories: set[str] = set()
    for item in annotations:
        for vulnerability in item.get("vulnerabilities", []):
            category = vulnerability.get("category")
            if category:
                categories.add(str(category))
    return categories


def get_timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def parse_json_answer(json_str: str) -> dict:
    if not json_str:
        return {"error": "empty_response"}

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", json_str)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except json.JSONDecodeError:
            pass

    start = json_str.find("{")
    end = json_str.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = json_str[start: end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            return {
                "error": "invalid_json_after_extraction",
                "details": str(e),
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
    # FIX (nhỏ 1): dùng %f để có microseconds, tránh trùng tên khi nhiều worker
    # chạy song song và gọi hàm này trong cùng millisecond.
    safe_name = (org_file_path or f"prompt-{prompt_idx}").replace("/", "-").replace("\\", "-")
    safe_name = re.sub(r"[^a-zA-Z0-9._-]+", "-", safe_name).strip("-")
    if not safe_name:
        safe_name = f"prompt-{prompt_idx}"
    return Path(outlogs) / f"{datetime.now().strftime('%H%M%S_%f')}_{prompt_idx:05d}_{safe_name}.json"


def main(root_dir: str | Path | None = None):
    runtime_root = Path(root_dir).expanduser().resolve() if root_dir else project_root

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")

    requests_per_minute = get_env_int("REQUESTS_PER_MINUTE", 12, 1)
    max_in_flight_requests = get_env_int("MAX_IN_FLIGHT_REQUESTS", 4, 1)

    print(
        f"Queue config: REQUESTS_PER_MINUTE={requests_per_minute}, "
        f"MAX_IN_FLIGHT_REQUESTS={max_in_flight_requests}"
    )
    print(f"Runtime root: {runtime_root}")

    for gemma_model in ["gemma-4-31b-it"]:
        print(f"=== STARTING EVALUATION WITH MODEL {gemma_model} ===")
        data = smartbugs_prompt(runtime_root=runtime_root)
        outlogs = Path(data["outlogs"])
        total_prompts = len(data["prompts"])
        print(f"Total prompts to process: {total_prompts}\n")

        # FIX (nhỏ 2): tạo thư mục output trước khi worker bắt đầu ghi file,
        # tránh FileNotFoundError khi write_json chạy lần đầu.
        (outlogs / "summary").mkdir(parents=True, exist_ok=True)

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
                    # FIX (bug 1): phải kiểm tra thêm in_flight == 0.
                    # Nếu queue đã closed + pending == 0 nhưng vẫn còn
                    # in_flight > 0, tức là có task đang chạy ở worker khác
                    # và chưa gọi mark_done() → KHÔNG được thoát, phải tiếp
                    # tục chờ. Thoát sớm ở đây sẽ khiến queue bị treo mãi.
                    if stats.closed and stats.pending == 0 and stats.in_flight == 0:
                        break
                    continue

                prompt_idx, current_prompt = task
                log_file = build_log_file(
                    outlogs=outlogs,
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

                    if (
                        response.candidates
                        and response.candidates[0].content
                        and response.candidates[0].content.parts
                    ):
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
                    # FIX (bug 2): mark_done() được tách ra khỏi try/except của
                    # write_json. Trước đây nó nằm trong finally của block ghi
                    # file, nên nếu write_json throw thì mark_done() bị nuốt lỗi.
                    # Tách riêng đảm bảo slot luôn được giải phóng đúng cách,
                    # và nếu mark_done() lỗi thì exception sẽ nổi lên rõ ràng.
                    in_flight_now = request_queue.mark_done()

                    try:
                        result_file = log_file.with_name(log_file.stem + "_result.json")
                        pred_output["log_file"] = str(result_file)
                        print(f"Writing result for prompt #{prompt_idx} to {result_file}:\n{json.dumps(pred_output, indent=2)}\n")
                        write_json(result_file, pred_output)

                        with results_lock:
                            result_by_index[prompt_idx] = str(result_file)
                    except Exception as result_write_error:
                        print(
                            f"Failed to write result for prompt #{prompt_idx}: "
                            f"{result_write_error}"
                        )

                    with progress_lock:
                        progress["done"] += 1
                        done_now = progress["done"]
                    print(
                        f"[{gemma_model}] worker-{worker_id} finished "
                        f"{done_now}/{total_prompts} | in_flight={in_flight_now}"
                    )

        workers = []
        for wid in range(1, worker_count + 1):
            thread = threading.Thread(target=worker, args=(wid,), daemon=True)
            workers.append(thread)
            thread.start()

        for thread in workers:
            thread.join()

        summarized_results = [result_by_index[i] for i in sorted(result_by_index)]
        write_json(
            outlogs / "summary" / f"{datetime.now().strftime('%H%M%S')}.json",
            summarized_results,
        )
        print(f"=== FINISHED EVALUATION WITH MODEL {gemma_model} ===\n\n")


if __name__ == "__main__":
    main()