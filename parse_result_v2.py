import argparse
import csv
import json
from pathlib import Path
from typing import Any
import re


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


# ---------------------------------------------------------------------------
# Line normalisation helpers
# ---------------------------------------------------------------------------

def _parse_single_line_token(token: str) -> list[tuple[int, int]]:
    """
    Parse one atomic token (no commas/semicolons) into (start, end) ranges.

    Supported formats:
      "12"       -> (12, 12)
      "12-15"    -> (12, 15)
      "line 12"  -> (12, 12)   (first number extracted)
    """
    token = token.strip()
    if not token:
        return []
    # explicit range "x-y"
    m = re.match(r'^(\d+)\s*-\s*(\d+)$', token)
    if m:
        start, end = int(m.group(1)), int(m.group(2))
        if start > end:
            start, end = end, start
        return [(start, end)]
    # single number possibly embedded in text
    m2 = re.search(r'(\d+)', token)
    if m2:
        n = int(m2.group(1))
        return [(n, n)]
    return []


def _normalize_line_values(value: Any) -> list[tuple[int, int]]:
    """
    Normalize any line representation into a flat list of inclusive (start, end) ranges.

    Handles all observed formats:
      None / ""                       -> []
      18                              -> [(18, 18)]
      "24"                            -> [(24, 24)]
      "32-35"                         -> [(32, 35)]
      "12, 15"  /  "12; 15"          -> [(12,12), (15,15)]
      ["32-35"]                       -> [(32, 35)]
      ["24", "25"]                    -> [(24,24), (25,25)]
      [["32-35"], ["24"]]             -> [(32,35), (24,24)]
      ["114", "338"], ["278-288"]     -> flattened recursively
    """
    ranges: list[tuple[int, int]] = []
    if value is None:
        return ranges
    if isinstance(value, (int, float)):
        n = int(value)
        return [(n, n)]
    if isinstance(value, list):
        for item in value:
            ranges.extend(_normalize_line_values(item))
        return ranges
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return ranges
        parts = re.split(r'[,;]', s)
        for part in parts:
            ranges.extend(_parse_single_line_token(part))
        return ranges
    # fallback: stringify then recurse
    return _normalize_line_values(str(value))


def _line_covered(gt_line: Any, pred_line: Any) -> bool:
    """
    Return True if pred_line fully covers gt_line.

    For EACH gt (start, end) range, at least ONE pred (start, end) range must satisfy:
        pred_start <= gt_start  AND  pred_end >= gt_end

    All gt ranges must be covered (AND across gt ranges, OR across pred ranges).

    Single-value case:  gt=(18,18), pred=(18,18)  -> 18 <= 18 <= 18  -> True
    Range case:         gt=(32,35), pred=(30,40)  -> 30 <= 32 and 40 >= 35 -> True
    """
    gt_ranges = _normalize_line_values(gt_line)
    if not gt_ranges:
        return False

    pred_ranges = _normalize_line_values(pred_line)
    if not pred_ranges:
        return False

    for gt_start, gt_end in gt_ranges:
        covered = any(
            pred_start <= gt_start and pred_end >= gt_end
            for pred_start, pred_end in pred_ranges
        )
        if not covered:
            return False
    return True


# ---------------------------------------------------------------------------
# Main localization evaluation
# ---------------------------------------------------------------------------

def compute_localization_correct(
    gt_vulnerability: Any,
    gt_line: Any,
    pred_vul_list: list[Any],
    pred_line_list: list[Any],
) -> str:
    """
    Iterate pred_vul_list by index; for each entry whose vulnerability type matches
    gt_vulnerability (case-insensitive), check whether the corresponding pred_line
    covers gt_line.

    Returns:
      ""      – gt_vulnerability is empty/None (not evaluable)
      "True"  – at least one matching pred entry covers gt_line
      "False" – no matching pred entry covers gt_line
    """
    if not gt_vulnerability:
        return ""

    gt_vul_str = str(gt_vulnerability).strip().lower()

    for i, pv in enumerate(pred_vul_list):
        if pv is None:
            continue
        if str(pv).strip().lower() != gt_vul_str:
            continue
        # Vulnerability type matched – check corresponding line
        pred_line = pred_line_list[i] if i < len(pred_line_list) else None
        if _line_covered(gt_line, pred_line):
            return str(True)

    return str(False)


# ---------------------------------------------------------------------------
# Row / CSV helpers  (unchanged)
# ---------------------------------------------------------------------------

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

        localization_correct = ""
        if gt_vulnerability:
            localization_correct = compute_localization_correct(
                gt_vulnerability, gt_line, pred_vul_list, pred_line_list
            )

        rows.append(
            {
                "filename": str(filename),
                "gt_vernerability": gt_vulnerability,
                "gt_line": to_json_cell(gt_line),
                "pred_vulnerability": to_json_cell(pred_vul_list),
                "pred_line": to_json_cell(pred_line_list),
                "reasoning": to_json_cell(reasoning),
                "detection_correct": detection_correct,
                "localization_correct": localization_correct,
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