import sys
from pathlib import Path

# Ensure project root is on sys.path so `libs` is importable when running
# this script directly (e.g., `python preprocess/smc-preprocess.py`).
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
	sys.path.insert(0, str(project_root))

from libs.libfile import query_files_by_extension, read_items_in_directory

NAME_FILE = "Proof-of-Patch"
ROOT_PROJECT_FOLDER = project_root
# Expect dataset folder at <workspace_root>/dataset when exploit-lab is at <workspace_root>/demos/exploit-lab.
WORKSPACE_ROOT = ROOT_PROJECT_FOLDER.parent.parent
ROOT_DATASET_FOLDER = WORKSPACE_ROOT / "dataset" / NAME_FILE

OUTPUT_DATA_DIR = ROOT_PROJECT_FOLDER / "data" / f"{NAME_FILE}-data"
OUTPUT_ANNOTATION_FILE = ROOT_PROJECT_FOLDER / "data" / f"{NAME_FILE}-annotations.csv"

files = read_items_in_directory(str(ROOT_DATASET_FOLDER), recursive=True, skip=[".js", ".md"])

def remove_annotations(file):
    pass

for file in files:
  print(file)