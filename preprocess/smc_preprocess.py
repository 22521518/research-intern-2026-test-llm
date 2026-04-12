import json
import os
import re
import sys
from pathlib import Path

# Ensure project root is on sys.path so `libs` is importable when running
# this script directly (e.g., `python preprocess/smc-preprocess.py`).
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
	sys.path.insert(0, str(project_root))

from libs.libfile import clear_block_preserve_lines, get_content, read_json, read_items_in_directory, write_to_file


NAME_FILE = "smartbugs-curated"
ROOT_PROJECT_FOLDER = project_root
# Expect dataset folder at <workspace_root>/dataset when exploit-lab is at <workspace_root>/demos/exploit-lab.
WORKSPACE_ROOT = ROOT_PROJECT_FOLDER.parent.parent
ROOT_DATASET_FOLDER = WORKSPACE_ROOT / "dataset" / NAME_FILE
LABEL_FILE = ROOT_DATASET_FOLDER / "vulnerabilities.json"

OUTPUT_DATA_DIR = ROOT_PROJECT_FOLDER / "data" / f"{NAME_FILE}-data"
OUTPUT_ANNOTATION_FILE = ROOT_PROJECT_FOLDER / "data" / f"{NAME_FILE}-annotations.json"

def create_vulnerability(lines: int, category: str) -> dict:
    return {
        "lines": lines,
        "category": category
    }

def create_annotation(file_path: str, vulnerabilities: list[dict]) -> dict:
    proccess_text_path = Path(OUTPUT_DATA_DIR) / file_path
    return {
        "dataset_name": "smartbugs-curated",
        "org_file_laptop_path": str(Path(ROOT_DATASET_FOLDER) / file_path),
        "org_file_path": file_path,
        "processed_file_path": str(proccess_text_path),
        "vulnerabilities": vulnerabilities
    }
    
def get_vulnerability_categories(content: list[dict] = None) -> set[str]:
    if content is None:
        content = read_json(str(LABEL_FILE))
    categories = set()
    for c in content:
        for v in c["vulnerabilities"]:
            categories.add(v["category"])
    return categories

def get_native_vulnerabilities(content: list[dict] = None) -> list[dict]:
    if content is None:
        content = read_json(str(LABEL_FILE))
    output_anno = []
    for c in content:
        vulnerabilities = []
        for v in c["vulnerabilities"]:
            vulnerabilities.append(create_vulnerability(v["lines"], v["category"]))
        output_anno.append(create_annotation(c["path"], vulnerabilities))
    return output_anno

# HAVE DONT WITH THIS YET
# def flatten_vulnerabilities(content: list[dict] = None) -> list[dict]:
#     if content is None:
#         content = get_native_vulnerabilities()
        
#     output_anno = []
#     for c in content:
#         for v in c["vulnerabilities"]:
#             output_anno.append({
#                 "dataset_name": "smartbugs-curated",
#                 "org_file_laptop_path": os.path.join(ROOT_DATASET_FOLDER, c["org_file_path"]),
#                 "org_file_path": c["org_file_path"],
#                 "gt_line": v["lines"],
#                 "gt_vulnerability": v["category"]
#             })
#     return output_anno


# REMOVE DATASET-ADDED ANNOTATIONS (E.G., @source, @vulnerable_at_lines, // <yes> <report> ...)
dataset_block_with_source_pattern = r'(?s)/\*.*?(?:@source:|@vulnerable_at_lines:).*?\*/'
dataset_orphan_block_with_source_pattern = r'(?m)^[ \t]*(?://|\*)[ \t]*@(?:source|vulnerable_at_lines):.*$'
dataset_inline_report_pattern = r'(?m)^[ \t]*//[ \t]*<yes>[ \t]*<report>.*$'
dataset_orphan_inline_report_pattern = r'(?m)^([ \t]*//[ \t]*)(?:<yes>[ \t]*<report>).*$'

def process_text(text: str) -> tuple[str, int]:
    """Process a Solidity source text, removing dataset annotations.

    Returns (new_text, changes_count).
    """
    changes = 0

    # Remove or blank-out block comments that contain @source or @vulnerable_at_lines
    block_re = re.compile(dataset_block_with_source_pattern, re.S)
    def _block_sub(m):
        nonlocal changes
        changes += 1
        return clear_block_preserve_lines(m)

    text = block_re.sub(_block_sub, text)

    # Remove inline dataset report markers but keep the comment markers (i.e. turn '// <yes> <report> ...' -> '//')
    inline_re = re.compile(dataset_orphan_inline_report_pattern, re.M)
    new_text, n = inline_re.subn(lambda m: m.group(1).rstrip(), text)
    changes += n
    text = new_text

    # Also strip any orphan lines that are single-line comments starting with '@source' or '@vulnerable_at_lines'
    orphan_re = re.compile(dataset_orphan_block_with_source_pattern)
    text, n2 = orphan_re.subn(lambda m: m.group(0).split(':',1)[0] + ':', text)
    changes += n2

    return text, changes


def process_file(path: str) -> tuple[str, int]:
    text = get_content(path)
    new_text, changes = process_text(text)
    return new_text, changes

if __name__ == "__main__":
    files = get_native_vulnerabilities()
    write_to_file(str(OUTPUT_ANNOTATION_FILE), json.dumps(files, indent=2))

    for f in files:  # TODO: remove slicing to process all files
        processed_text, changes = process_file(f["org_file_laptop_path"])
        write_to_file(f["processed_file_path"], processed_text)
        print(f"Processed {f['processed_file_path']} with {changes} changes.")