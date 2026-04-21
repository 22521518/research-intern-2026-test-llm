# exploit-lab — Hướng dẫn chạy

Tài liệu ngắn này mô tả cách thiết lập môi trường, chạy `main.py` và `parse_result_v2.py`, và giải thích các file artifacts tạo ra.

**Yêu cầu**

- Python 3.8+ và `pip`.
- Windows PowerShell hoặc CMD (hướng dẫn dưới dùng PowerShell).

**Thiết lập môi trường**
Từ thư mục gốc của dự án (thư mục chứa `main.py` và `parse_result_v2.py`):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Additional packages (recommended for running or developing LLM adapters):

```powershell
# From a normal shell
pip install -U -q transformers huggingface_hub
pip install -q -U bitsandbytes accelerate

# If you're in a Jupyter notebook use the `!` prefix:
#!pip install -U -q transformers huggingface_hub
#!pip install -q -U bitsandbytes accelerate
```

Nếu dự án đã có virtualenv sẵn (ví dụ `.venv_gg_genai`), kích hoạt thay vì tạo mới.

**Chạy**

- Chạy `main.py` (từ thư mục `exploit-lab`):

```powershell
python main.py
```

- Chạy script phân tích kết quả: `parse_result_v2.py` (ví dụ):

```powershell
# Ví dụ: dùng summary JSON từ thư mục log và ghi ra results/output.csv
python parse_result_v2.py log/smartbugs-curated/20260413_083744/summary/095110.json -o results/output.csv

# Hoặc không chỉ định -o để dùng đường dẫn mặc định:
python parse_result_v2.py log/smartbugs-curated/20260413_083744/summary/095110.json
# -> sẽ tạo: log/smartbugs-curated/20260413_083744/summary/095110_flattened.csv
```

Ghi chú: `parse_result_v2.py` nhận một file summary JSON (một danh sách các đường dẫn tới file kết quả). Script sẽ cố gắng ánh xạ các đường dẫn này tới file local; nếu một vài file không tìm thấy, script sẽ in cảnh báo và bỏ qua chúng.

**Artifacts / Output**

- `log/smartbugs-curated/<timestamp>/` — thư mục chứa kết quả chạy, thường gồm các file `*_result.json`, các file `.json` của từng case, và một thư mục `summary/` chứa summary JSON.
- `results/` — (tuỳ ví dụ) nơi bạn có thể lưu CSV tổng hợp, ví dụ `results/output.csv`.
- Khi chạy `parse_result_v2.py` mà không dùng `-o`, file mặc định sẽ là `<summary_name>_flattened.csv` trong cùng thư mục summary.

CSV tạo ra bởi `parse_result_v2.py` có các cột (fieldnames):

- `filename`: đường dẫn file gốc
- `gt_vernerability`: (chuỗi) loại lỗ hổng ground-truth (lưu ý tên trường giữ nguyên như trong code)
- `gt_line`: (JSON/string) dòng hoặc khoảng dòng ground-truth
- `pred_vulnerability`: (JSON) danh sách lỗ hổng được dự đoán
- `pred_line`: (JSON) danh sách bằng chứng dòng tương ứng của dự đoán
- `reasoning`: (JSON/string) reasoning (nếu có)
- `detection_correct`: `True`/`False` (chuỗi) — liệu loại lỗ hổng có được phát hiện đúng không
- `localization_correct`: `True`/`False`/`` — liệu vị trí (dòng) có được định vị chính xác không

**Troubleshooting nhanh**

- Nếu bạn thấy cảnh báo về file bị thiếu: kiểm tra đường dẫn trong summary JSON và cấu trúc thư mục `log/...` để đảm bảo các file kết quả tồn tại.
- Script `parse_result_v2.py` có một số chiến lược ánh xạ đường dẫn; nếu cần, sửa hoặc chuẩn hoá summary JSON.

**Tham chiếu tệp**

- [main.py](main.py)
- [parse_result_v2.py](parse_result_v2.py)

---

Tạo bởi: hướng dẫn nhanh từ developer.

NOTE: nếu chạy trên các điều hành không phải Windows sẽ bị lỗi do format path. Dưới đây là mẫu chạy cho hệ điều hành linux (để test trên kaggle, lưu ý: kaggle sẽ bị lỗi request run out of time):

```python
import json
import os

# Đường dẫn file gốc
file_path = '/kaggle/working/research-intern-2026-test-llm/data/smartbugs-curated-annotations.json'

def overwrite_with_fixed_paths(target_file):
    # 1. Đọc dữ liệu hiện tại
    if not os.path.exists(target_file):
        print(f"❌ Không tìm thấy file tại: {target_file}")
        return

    with open(target_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Thư mục gốc trên Kaggle (dựa theo đường dẫn bạn cung cấp)
    base_dir = "/kaggle/working/research-intern-2026-test-llm"

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

# Thực hiện
overwrite_with_fixed_paths(file_path)
```
