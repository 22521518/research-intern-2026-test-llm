"""HF CodeGemma adapter that follows the shared LLMAdapter contract.

Input format is always a raw prompt string and output is always
`(response_text, thinking_text)`.
"""
from __future__ import annotations

import torch
import warnings
from typing import Any
from llm_adapter import LLMAdapter

try:
    from transformers import GemmaTokenizer, AutoModelForCausalLM
except Exception as _err:  # pragma: no cover - import-time fallback
    GemmaTokenizer = None
    AutoModelForCausalLM = None


class HFCodeGemmaAdapter(LLMAdapter):
    """Adapter around Hugging Face CodeGemma models.

    Args:
        api_key: ignored (kept for compatibility with other adapters)
        model_name: HF model id, e.g. "google/codegemma-7b-it"
        device: optional device string like "cuda" or "cpu"
    """

    def __init__(self, api_key: Any = None, model_name: str = "google/codegemma-7b-it", device: str | None = None) -> None:
        super().__init__(model_name=model_name, name=model_name)
        if GemmaTokenizer is None or AutoModelForCausalLM is None:
            raise RuntimeError("transformers not available; install with `pip install transformers torch`")
        self.device = device
        # Load tokenizer + model (may download large weights)
        self.tokenizer = GemmaTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name)
        if device:
            try:
                self.model.to(device)
            except Exception:
                warnings.warn(f"Could not move model to device {device}; continuing on default device")

    def generate(
        self,
        prompt: str,
        temperature: float = 0.1,
        include_thoughts: bool = True,
    ) -> tuple[str, str]:
        """Generate text from `prompt` and return normalized `(response, thinking)`.

        Local HF generation does not expose explicit thought channels, so
        `thinking` is currently returned as an empty string.
        """
        inputs = self.tokenizer(prompt, return_tensors="pt")
        gen_kwargs = {}

        if temperature and temperature > 0:
            gen_kwargs["do_sample"] = True
            gen_kwargs["temperature"] = float(temperature)
        else:
            gen_kwargs["do_sample"] = False

        inputs = {k: v.to(self.model.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model.generate(**inputs, **gen_kwargs)

        input_len = inputs["input_ids"].shape[-1]
        generated_ids = outputs[0][input_len:]
        text = self.tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

        _ = include_thoughts
        return text, ""
