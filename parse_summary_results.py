import argparse
import csv
import json
from pathlib import Path
from typing import Any


def to_json_cell(value: Any) -> str:
    """Serialize complex values so they fit into one CSV cell."""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    if value is None:
        return ""
    return str(value)


def find_research_root(summary_path: Path) -> Path | None:
    """Find local folder named research-intern-2026-test-llm from summary path."""
    for parent in summary_path.parents:
        if parent.name == "research-intern-2026-test-llm":
            return parent
    return None


def resolve_result_path(raw_path: str, summary_path: Path) -> Path:
    """Resolve each listed result file path from summary to a local file path."""
    raw = Path(raw_path)

    # 1) Use the path directly if it already exists locally.
    if raw.exists():
        return raw

    # 2) Most reliable fallback in this dataset: same run directory, same filename.
    run_dir = summary_path.parent.parent
    by_name = run_dir / raw.name
    if by_name.exists():
        return by_name

    # 3) Try mapping /kaggle/working/research-intern-2026-test-llm/... to local root.
    marker = "research-intern-2026-test-llm/"
    normalized = raw_path.replace("\\", "/")
    if marker in normalized:
        suffix = normalized.split(marker, 1)[1]
        research_root = find_research_root(summary_path)
        if research_root is not None:
            mapped = research_root / Path(*suffix.split("/"))
            if mapped.exists():
                return mapped

    raise FileNotFoundError(f"Could not resolve listed file path: {raw_path}")


def extract_predicted_columns(predicted_vulnerabilities: Any) -> tuple[list[Any], list[Any]]:
    """Return predicted vulnerability list and corresponding predicted evidence list."""
    pred_vul_list: list[Any] = []
    pred_line_list: list[Any] = []

    if not isinstance(predicted_vulnerabilities, list):
        return pred_vul_list, pred_line_list

    for item in predicted_vulnerabilities:
        if isinstance(item, dict):
            pred_vul_list.append(item.get("vulnerability_type"))
            pred_line_list.append(item.get("evidence"))
        else:
            pred_vul_list.append(item)
            pred_line_list.append(None)

    return pred_vul_list, pred_line_list


def iter_rows(result_data: dict[str, Any]) -> list[dict[str, str]]:
    """Flatten vulnerabilities so each row corresponds to one ground-truth vulnerability item."""
    filename = result_data.get("org_file_path", "")
    vulnerabilities = result_data.get("vulnerabilities")
    predicted = result_data.get("predicted_vulnerabilities")
    reasoning = result_data.get("reasoning")

    pred_vul_list, pred_line_list = extract_predicted_columns(predicted)
    pred_set = {str(v).lower() for v in pred_vul_list if v is not None}

    if not isinstance(vulnerabilities, list) or len(vulnerabilities) == 0:
        vulnerabilities = [None]

    rows: list[dict[str, str]] = []
    for vuln in vulnerabilities:
        gt_vulnerability = ""
        gt_line: Any = ""

        if isinstance(vuln, dict):
            gt_vulnerability = str(vuln.get("category", ""))
            gt_line = vuln.get("lines", "")

        detection_correct = ""
        if gt_vulnerability:
            detection_correct = str(gt_vulnerability.lower() in pred_set)

        rows.append(
            {
                "filename": str(filename),
                "gt_vernerability": gt_vulnerability,
                "gt_line": to_json_cell(gt_line),
                "pred_vulnerability": to_json_cell(pred_vul_list),
                "pred_line": to_json_cell(pred_line_list),
                "reasoning": to_json_cell(reasoning),
                "detection_correct": detection_correct,
                "localization_correct": "",
            }
        )

    return rows


def parse_summary(summary_path: Path) -> list[dict[str, str]]:
    with summary_path.open("r", encoding="utf-8") as f:
        listed_files = json.load(f)

    if not isinstance(listed_files, list):
        raise ValueError("Summary JSON must be a list of result file paths.")

    all_rows: list[dict[str, str]] = []
    missing_files: list[str] = []

    for listed_path in listed_files:
        if not isinstance(listed_path, str):
            continue

        try:
            result_file = resolve_result_path(listed_path, summary_path)
        except FileNotFoundError:
            missing_files.append(listed_path)
            continue

        with result_file.open("r", encoding="utf-8") as f:
            result_data = json.load(f)

        if isinstance(result_data, dict):
            all_rows.extend(iter_rows(result_data))

    if missing_files:
        print(f"[WARN] Missing {len(missing_files)} listed files. They were skipped.")

    return all_rows


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    fieldnames = [
        "filename",
        "gt_vernerability",
        "gt_line",
        "pred_vulnerability",
        "pred_line",
        "reasoning",
        "detection_correct",
        "localization_correct",
    ]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Parse summary JSON and flatten vulnerabilities into a CSV table."
    )
    parser.add_argument(
        "summary_path",
        type=Path,
        help="Path to summary JSON listing result files.",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output CSV path. Default: <summary_folder>/<summary_name>_flattened.csv",
    )
    args = parser.parse_args()

    summary_path = args.summary_path
    if not summary_path.exists():
        raise FileNotFoundError(f"Summary file not found: {summary_path}")

    output_path = args.output
    if output_path is None:
        output_path = summary_path.parent / f"{summary_path.stem}_flattened.csv"

    rows = parse_summary(summary_path)
    write_csv(rows, output_path)
    print(f"Done. Wrote {len(rows)} rows to: {output_path}")


if __name__ == "__main__":
    main()
