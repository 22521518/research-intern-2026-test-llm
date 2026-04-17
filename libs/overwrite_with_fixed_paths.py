
import json
import os
import sys

from anyio import Path


def overwrite_with_fixed_paths(target_file, base_dir="project_root"):
    # 1. Đọc dữ liệu hiện tại
    if not os.path.exists(target_file):
        print(f"❌ Không tìm thấy file tại: {target_file}")
        return

    with open(target_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 2. Xử lý sửa lỗi đường dẫn
    for item in data:
        # Sửa processed_file_path (Xử lý dấu .\ và đổi xoẹt)
        if "processed_file_path" in item:
            clean_proc = item["processed_file_path"].replace("\\", "/").replace("./", "")
            item["processed_file_path"] = os.path.join(base_dir, clean_proc)

        # Xóa đường dẫn laptop không cần thiết
        item.pop("org_file_laptop_path", None)

    # 3. Ghi đè lại chính file đó
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Đã ghi đè thành công file: {target_file}")