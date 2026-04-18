from pathlib import Path
from datetime import datetime
import sys
import os
import json
import re
import threading
import time

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
from llm_adapter import LLMAdapter, GeminiAdapter

# ---------------------------------------------------------------------------
# Retry config
# ---------------------------------------------------------------------------
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}
MAX_RETRIES     = 5
RETRY_BASE_SECS = 2.0
RETRY_MAX_SECS  = 60.0


def _is_retryable(exc: Exception) -> bool:
    msg = str(exc)
    return any(str(code) in msg for code in RETRYABLE_STATUS_CODES)


def call_with_retry(fn, *args, **kwargs):
    """Gọi fn(), retry với exponential backoff nếu gặp lỗi retryable.

    Delays: 2s → 4s → 8s → 16s → 32s (capped 60s).
    Raise exception gốc nếu hết retry.
    """
    last_exc: Exception | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            return fn(*args, **kwargs)
        except Exception as exc:
            last_exc = exc
            if attempt < MAX_RETRIES and _is_retryable(exc):
                wait = min(RETRY_BASE_SECS * (2 ** attempt), RETRY_MAX_SECS)
                print(f"[retry] attempt {attempt + 1}/{MAX_RETRIES} ({exc}), waiting {wait:.1f}s...")
                time.sleep(wait)
            else:
                raise
    raise last_exc


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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
            return {"error": "invalid_json_after_extraction", "details": str(e), "candidate": candidate}
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


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(get_data_prompt = smartbugs_prompt, root_dir: str | Path | None = None, adapters: list | None = None):
    """Run evaluation.

    Args:
        get_data_prompt: A function to retrieve the evaluation data.
        root_dir: runtime root directory.
        adapters: optional list of LLM adapter descriptors. Each item may be:
            - an `LLMAdapter` instance (will be used as-is), or
            - a callable factory returning an `LLMAdapter` instance, or
            - a class (callable) that constructs an `LLMAdapter` when called.
            If `None`, a default Gemini adapter is used.
    """

    runtime_root = Path(root_dir).expanduser().resolve() if root_dir else project_root

    api_key = os.getenv("GOOGLE_API_KEY")
    # if not api_key:
    #     raise RuntimeError("GOOGLE_API_KEY is not set")

    requests_per_minute    = get_env_int("REQUESTS_PER_MINUTE", 12, 1)
    max_in_flight_requests = get_env_int("MAX_IN_FLIGHT_REQUESTS", 4, 1)

    print(
        f"Queue config: REQUESTS_PER_MINUTE={requests_per_minute}, "
        f"MAX_IN_FLIGHT_REQUESTS={max_in_flight_requests}"
    )
    print(f"Runtime root: {runtime_root}")

    # Normalize adapters list and provide a default if none given
    if adapters is None:
        adapters = [GeminiAdapter(api_key=api_key, model_name="gemma-4-31b-it")]

    for adapter_entry in adapters:
        # Determine a human-friendly adapter name without forcing heavy instantiation
        if isinstance(adapter_entry, LLMAdapter):
            llm_name = adapter_entry.name
            preview_factory = lambda entry=adapter_entry: entry
        elif callable(adapter_entry):
            # Try to infer name from the callable/class
            inferred = getattr(adapter_entry, "name", None) or getattr(adapter_entry, "__name__", None)
            if inferred and inferred != "<lambda>":
                llm_name = inferred
                preview_factory = adapter_entry
            else:
                # fallback: attempt a light instantiation to get the name
                try:
                    preview = adapter_entry()
                    llm_name = getattr(preview, "name", getattr(preview, "model_name", preview.__class__.__name__))
                    preview_factory = adapter_entry
                except Exception:
                    llm_name = str(adapter_entry)
                    preview_factory = adapter_entry
        else:
            llm_name = str(adapter_entry)
            preview_factory = lambda: adapter_entry

        print(f"=== STARTING EVALUATION WITH LLM {llm_name} ===")
        data = get_data_prompt(runtime_root=runtime_root)
        # place logs under a subfolder per LLM to avoid collisions
        outlogs = Path(data["outlogs"]) / llm_name.replace("/", "-")
        total_prompts = len(data["prompts"]) 
        print(f"Total prompts to process: {total_prompts}\n")

        (outlogs / "summary").mkdir(parents=True, exist_ok=True)

        request_queue: GoogleAIRequestQueue[tuple[int, dict]] = GoogleAIRequestQueue(
            max_in_flight=max_in_flight_requests,
            requests_per_minute=requests_per_minute,
        )

        for idx, current_prompt in enumerate(data["prompts"][:1], start=1):  # Process only the first 10 prompts as an example
            if isinstance(current_prompt, dict):
                request_queue.put((idx, current_prompt))
            else:
                request_queue.put((idx, {"content": str(current_prompt)}))
        request_queue.close()

        result_by_index: dict[int, str] = {}
        results_lock  = threading.Lock()
        progress_lock = threading.Lock()
        progress      = {"done": 0}
        worker_count  = max_in_flight_requests

        # Worker factory: create adapter instances per worker by calling the
        # preview_factory (which may return a shared instance or create new ones).
        adapter_factory = preview_factory

        def worker(worker_id: int) -> None:
            worker_adapter = adapter_factory()
            while True:
                task = request_queue.take_ready(timeout=1.0)
                if task is None:
                    stats = request_queue.stats()
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
                    "dataset_name":              current_prompt.get("dataset_name", "unknown"),
                    "org_file_path":             current_prompt.get("org_file_path"),
                    "processed_file_path":       current_prompt.get("processed_file_path"),
                    "vulnerabilities":           current_prompt.get("vulnerabilities", []),
                    "predicted_vulnerabilities": [],
                    "reasoning":                 [],
                    "log_file":                  "",
                    "error":                     None,
                    "retries":                   0,
                }

                attempt_count = 0
                try:
                    def _call():
                        nonlocal attempt_count
                        attempt_count += 1
                        return worker_adapter.generate(
                            prompt=current_prompt["content"],
                            temperature=0.0,
                            include_thoughts=True,
                        )

                    response_text, thinking_text = call_with_retry(_call)
                    pred_output["retries"] = attempt_count - 1

                    write_json(
                        log_file,
                        {
                            "adapter": getattr(worker_adapter, "name", worker_adapter.__class__.__name__),
                            "response": response_text,
                            "thinking": thinking_text,
                        },
                    )

                    if thinking_text:
                        pred_output["reasoning"].append(thinking_text)

                    processed_answer = parse_json_answer(response_text)
                    predicted = processed_answer.get("vulnerabilities", [])
                    if isinstance(predicted, list):
                        pred_output["predicted_vulnerabilities"].extend(predicted)

                except Exception as e:
                    pred_output["error"]   = str(e)
                    pred_output["retries"] = attempt_count - 1

                finally:
                    # Giải phóng slot trước, ghi file sau
                    in_flight_now = request_queue.mark_done()

                    try:
                        result_file = log_file.with_name(log_file.stem + "_result.json")
                        pred_output["log_file"] = str(result_file)
                        write_json(result_file, pred_output)
                        with results_lock:
                            result_by_index[prompt_idx] = str(result_file)
                    except Exception as write_err:
                        print(f"Failed to write result for prompt #{prompt_idx}: {write_err}")

                    with progress_lock:
                        progress["done"] += 1
                        done_now = progress["done"]

                    retry_info = f" retries={pred_output['retries']}" if pred_output["retries"] > 0 else ""
                    status     = "❌" if pred_output["error"] else "✅"
                    print(
                        f"[{llm_name}] worker-{worker_id} {status} "
                        f"{done_now}/{total_prompts} | in_flight={in_flight_now}{retry_info}"
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
        print(f"=== FINISHED EVALUATION WITH LLM {llm_name} ===\n\n")


if __name__ == "__main__":
    # Example: run with a Gemini adapter instance and the HF CodeGemma adapter class
    try:
        from hf_codegemma import HFCodeGemmaAdapter
    except Exception:
        HFCodeGemmaAdapter = None

    adapters = []
    # Gemini adapter instance (requires GOOGLE_API_KEY in env)
    try:
        adapters.append(GeminiAdapter(api_key=os.getenv("GOOGLE_API_KEY"), model_name="gemma-4-31b-it"))
    except Exception:
        # ignore if genai not configured; main() will still validate env
        pass

    # Add HF adapter class (callable). Instantiation (and heavy model load)
    # will happen per-worker when `adapter_factory()` is called.
    if HFCodeGemmaAdapter is not None:
        adapters.append(HFCodeGemmaAdapter)

    main(adapters=adapters)