import re
import os
import sys
from pathlib import Path
import json

import regex

# Ensure object root is on sys.path so `libs` is importable when running
# this script directly (e.g., `python preprocess/smc-preprocess.py`).
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
	sys.path.insert(0, str(project_root))

from libs.cmt_solidity_regex import single_line_comment_pattern, comment_patterns

######################################################### FILE UTILITIES ###############################################
def check_extension(filename, extension):
    return filename.endswith(extension)

def check_skip(filename, skip):
    for skip_item in skip:
        if skip_item in filename: return True
    return False

def count_folders_in_path(path: str, nested: bool = False) -> int:
    if not nested:
        return sum(1 for item in Path(path).iterdir() if item.is_dir())
    else:
        return sum(1 for item in Path(path).rglob("*") if item.is_dir())

def read_items_in_directory(directory, include_folders=False, recursive=False, skip=None):
    import os
    items = []
    if skip is None:
        skip = []

    if recursive:
        for root, dirs, filenames in os.walk(directory):
            for filename in filenames:
                if check_skip(filename, skip): continue
                items.append(os.path.join(root, filename))
            for dir in dirs:
                if check_skip(dir, skip): continue
                if include_folders:
                    items.append(os.path.join(root, dir))           
    else:
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            if os.path.isfile(item_path):
                if check_skip(item, skip): continue
                items.append(item_path)
            if os.path.isdir(item_path):
                if check_skip(item, skip): continue
                if include_folders:
                    items.append(item_path)
    return items


# Query files with a specific extension in a directory (flags: recursive or not)
def query_files_by_extension(directory, extension, recursive=False, skip=None):
    files = read_items_in_directory(directory, recursive=recursive, skip=skip)
    return [file for file in files if check_extension(file, extension)]

# if fromline == toline --> 1 line
def get_content(file_path, from_line=1, to_line=None):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        if to_line is None:
            to_line = len(lines)
        return ''.join(lines[(from_line - 1):(to_line)])
    
def write_to_file(file_path, content, skip_lines=None):
    if skip_lines is None:
        skip_lines = set() 
    else:
        skip_lines = set(skip_lines)

    folder = os.path.dirname(file_path)
    if folder and not os.path.exists(folder):
        os.makedirs(folder)

    lines = content.splitlines(keepends=True)
    filtered_lines = []

    for i, line in enumerate(lines, start=1):
        if i in skip_lines:
            filtered_lines.append("\n")
        else:
            filtered_lines.append(line)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(''.join(filtered_lines))

def clear_block_preserve_lines(match: re.Match) -> str:
    """Replace matched block comment by preserving the opening and closing markers and the original number of lines.

    This way we remove the internal content but keep the file line count roughly the same.
    """
    block = match.group(0)
    lines = block.splitlines()
    if len(lines) <= 2:
        return '/* */'
    # keep first and last line (usually '/*' and '*/'), replace middle lines with empty lines to preserve numbering
    middle = [''] * (len(lines) - 2)
    new_block = '\n'.join([lines[0]] + middle + [lines[-1]])
    return new_block

############################################### REGEX UTILITIES ###############################################
def get_content_with_regex(file_path, regex: list[str] | str, literal: bool = False) -> list[str]:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

        if isinstance(regex, str):
            patterns = [regex]
        else:
            patterns = list(regex)

        if literal:
            patterns = [re.escape(p) for p in patterns]

        combined = re.compile("|".join(patterns), re.MULTILINE)
        matches = combined.findall(content)
        return matches

def get_line_numbers_with_regex(file_path, regex: list[str] | str, literal: bool = False) -> list[int]:
    import re
    if isinstance(regex, str):
        patterns = [regex]
    else:
        patterns = list(regex)

    if literal:
        pattern_str = "|".join(re.escape(p) for p in patterns)
    else:
        pattern_str = "|".join(p for p in patterns)

    combined_pattern = re.compile(pattern_str, re.MULTILINE)

    matched_line_numbers = []
    with open(file_path, 'r', encoding='utf-8') as f:
        # handle multi-line block comments like '/\*[\s\S]*?\*/' by tracking
        # when a block starts and ends so the starting line (e.g., line 1) is included
        has_block = any(('/*' in p or r'\*' in p) and ('*/' in p or r'\*/' in p) for p in patterns)
        if has_block:
            if literal:
                start_re = re.compile(re.escape('/*'))
                end_re = re.compile(re.escape('*/'))
            else:
                start_re = re.compile(r'/\*')
                end_re = re.compile(r'\*/')

        in_block = False
        for i, line in enumerate(f, start=1):
            if in_block:
                matched_line_numbers.append(i)
                if has_block and end_re.search(line):
                    in_block = False
                continue

            if has_block and start_re.search(line):
                matched_line_numbers.append(i)
                if not (has_block and end_re.search(line)):
                    in_block = True
                continue

            if combined_pattern.search(line):
                matched_line_numbers.append(i)
    return matched_line_numbers

################################################# JSON UTILITIES ###############################################
def read_json(file_path):
    if(not os.path.exists(file_path)):
        raise FileNotFoundError(f"File not found: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_json(file_path, json_content):
    folder = os.path.dirname(file_path)
    if folder:
        os.makedirs(folder, exist_ok=True)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(json_content, f, indent=4)

def print_json(json_content):
    print(json.dumps(json_content, indent=4))

if __name__ == "__main__":
    target_folder = Path(__file__).resolve().parent.parent / "log"
    print(f"Folders in {target_folder}: ", count_folders_in_path(target_folder, True))