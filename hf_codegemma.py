"""HF CodeGemma adapter: wraps a transformers Gemma model

Provides a small adapter implementing `generate(model, contents, config)`
and returning a lightweight response object compatible with the shape used
in `main.py` (has `.candidates` with `.content.parts[i].text` and
`.model_dump()` for logging).

This is a simple, synchronous adapter intended for local testing or small
inference runs. It will attempt to import `transformers` and raise a
clear error if missing.
"""
from __future__ import annotations

import torch
import warnings
from typing import Any, List
from llm_adapter import LLMAdapter

try:
    from transformers import GemmaTokenizer, AutoModelForCausalLM
except Exception as _err:  # pragma: no cover - import-time fallback
    GemmaTokenizer = None
    AutoModelForCausalLM = None


class Part:
    def __init__(self, text: str, thought: bool = False) -> None:
        self.text = text
        self.thought = thought


class Content:
    def __init__(self, parts: List[Part]) -> None:
        self.parts = parts


class Candidate:
    def __init__(self, content: Content) -> None:
        self.content = content


class HFResponse:
    def __init__(self, model_name: str, candidates: List[Candidate], text: str) -> None:
        self._model = model_name
        self.candidates = candidates
        self._text = text

    def model_dump(self) -> dict:
        # Minimal serializable representation for logging
        return {
            "model": self._model,
            "text": self._text,
            "candidates": [
                {"content": {"parts": [{"text": p.text} for p in c.content.parts]}}
                for c in self.candidates
            ],
        }


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
            model_name,
            torch_dtype=torch.bfloat16,
            use_auth_token=True)
        if device:
            try:
                self.model.to(device)
            except Exception:
                warnings.warn(f"Could not move model to device {device}; continuing on default device")

    def generate(self, contents: str, config: Any = None) -> HFResponse:
        """Generate text for `contents`.

        The `model` parameter is accepted for API parity but the adapter
        will use the internal `model_name` passed at construction.
        """
        inputs = self.tokenizer(contents, return_tensors="pt")
        gen_kwargs = {}
        # Try to extract temperature from the config object if present
        try:
            temp = getattr(config, "temperature", None)
            if temp is not None:
                gen_kwargs["do_sample"] = True
                gen_kwargs["temperature"] = float(temp)
        except Exception:
            pass

        outputs = self.model.generate(**inputs, **gen_kwargs)
        text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        part = Part(text=text, thought=False)
        content = Content(parts=[part])
        candidate = Candidate(content=content)
        return HFResponse(model_name=self.model_name, candidates=[candidate], text=text)
