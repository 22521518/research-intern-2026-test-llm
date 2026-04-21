import os
import torch
from transformers import GemmaTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TextStreamer
from huggingface_hub import snapshot_download

# 1. Cấu hình Quantization để tránh lỗi Out of Memory (OOM)
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4"
)

model_repo_id = "google/codegemma-7b-it"
local_model_dir = os.path.join(os.path.dirname(__file__), "codegemma-7b-it")

# 0. Tải model từ HuggingFace Hub vào folder cục bộ
print(f"Downloading model {model_repo_id} to {local_model_dir}...")
model_path = snapshot_download(repo_id=model_repo_id, local_dir=local_model_dir)
print(f"Model downloaded to: {model_path}")

# 2. Load Tokenizer từ folder cục bộ
tokenizer = GemmaTokenizer.from_pretrained(model_path)

# 3. Load Model từ folder cục bộ với tự động phân bổ GPU (device_map="auto")
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    quantization_config=quantization_config,
    device_map="auto",  # Tự động chia model qua 2 card T4
    dtype="auto"
)

# # 4. Chuẩn bị Input (Không cần model.to(device) vì device_map đã lo việc đó)
# input_text = "Write me a Python function to calculate the nth fibonacci number."
# input_ids = tokenizer(input_text, return_tensors="pt").to("cuda")

# # 5. Generate
# outputs = model.generate(**input_ids, max_new_tokens=256)
# print(tokenizer.decode(outputs[0], skip_special_tokens=True))

import re
import json

def extract_json(text):
    # 1. Tìm nội dung giữa cặp ```json ... ```
    match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
    
    if match:
        json_str = match.group(1)
    else:
        # 2. Dự phòng: Nếu không có thẻ markdown, tìm cặp ngoặc nhọn đầu tiên
        match = re.search(r'(\{.*?\})', text, re.DOTALL)
        json_str = match.group(1) if match else None

    # 3. Kiểm tra tính hợp lệ bằng thư viện chuẩn
    try:
        return json_str
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return None # Dữ liệu không an toàn/lỗi

# 11. Parse Response chuẩn để tách Thinking và JSON
def parse_result(text):
    # Vì mình mồi <thinking>\n ở đầu, nên model sẽ viết tiếp nội dung bên trong
    # Chúng ta tìm tag đóng </thinking>
    thinking_part = ""
    json_match = ""
    
    if "</thinking>" in text:
        parts = text.split("</thinking>")
        thinking_part = parts
        # Tìm cục JSON trong phần còn lại
        json_match = extract_json(parts[1])
    else:
        # Trường hợp AI quên đóng tag hoặc output bị cắt ngang
        thinking_part = text
        
    return thinking_part, json_match

def prompt_me(prompt_me: str, enable_stream = False):
    # 5. Chuyển đổi sang định dạng OAI Messages
    messages = [
        {"role": "user", "content": prompt_me}
    ]
    
    # 6. Apply Template và mồi tag <thinking>
    # Lưu ý: CodeGemma dùng tokenizer để apply template thay vì processor nếu chỉ xử lý text
    prompt_text = tokenizer.apply_chat_template(
        messages, 
        tokenize=False, 
        add_generation_prompt=True
    )
    prompt_text += r"""Before generating the JSON, provide a brief 'Thinking' section enclosed in <thinking></thinking> tags to analyze logic step-by-step
    <thinking>\n"""  # Ép model phải phân tích trước
    
    # 7. Chuẩn bị Inputs
    inputs = tokenizer(prompt_text, return_tensors="pt").to(model.device)
    input_length = inputs["input_ids"].shape[-1]
    
    # 8. Cấu hình Streamer để xem AI trả lời realtime
    streamer = TextStreamer(tokenizer, skip_prompt=True) if enable_stream else None
    
    # 9. Generate
    
    outputs = model.generate(
        **inputs, 
        streamer=streamer, 
        # Sử dụng giá trị nhỏ hơn giữa giới hạn của bạn và tài nguyên còn lại
        max_new_tokens=4096, 
        do_sample=True,
        temperature=0.5, # Giảm thêm xuống 0.1 để cấu trúc JSON cực kỳ chặt chẽ
        top_p= 0.9,       # Thu hẹp top_p một chút để tránh các token "sáng tạo" làm hỏng JSON
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id
    )
    
    # 10. Giải mã Response (Chỉ lấy phần AI mới sinh ra)
    full_response = tokenizer.decode(outputs[0][input_length:], skip_special_tokens=False)
    return parse_result(full_response)

from llm_adapter import LLMAdapter

class HFCodeGemmaAdapter(LLMAdapter):
    def __init__(self, api_key: str = "", model_name: str = "", name: str | None = None) -> None:
        super().__init__(model_name=model_name, name=name)
        if not api_key:
            raise ValueError("api_key is required for HFCodeGemmaAdapter. Set a HuggingFace token or pass api_key.")

    def generate(
        self,
        prompt: str,
        temperature: float = 0.0,
        include_thoughts: bool = True,
    ) -> tuple[str, str]:
        # Keep provider-specific response parsing inside the adapter.
        thinking_text, json_str = prompt_me(prompt)
        return json_str, thinking_text