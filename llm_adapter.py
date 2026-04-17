from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

try:
    from google import genai
except Exception:  # genai may not be available in some environments
    genai = None


class LLMAdapter(ABC):
    """Abstract base class for LLM adapters.

    Implementations must provide `generate(contents, config)` and set
    `name` and `model_name` attributes for identification.
    """

    def __init__(self, model_name: str | None = None, name: str | None = None) -> None:
        self.model_name = model_name or name or self.__class__.__name__
        self.name = name or self.model_name

    @abstractmethod
    def generate(self, contents: str, config: Any):
        raise NotImplementedError


class GeminiAdapter(LLMAdapter):
    """Adapter for Google GenAI (Gemini) via `google.genai`.

    Args:
        api_key: API key for Google GenAI.
        model_name: model id, e.g. 'gemma-4-31b-it'.
    """

    def __init__(self, api_key: str, model_name: str = "gemma-4-31b-it", name: str | None = None) -> None:
        super().__init__(model_name=model_name, name=name)
        if genai is None:
            raise RuntimeError("google.genai is required for GeminiAdapter")
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)

    def generate(self, contents: str, config: Any):
        return self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=config,
        )
