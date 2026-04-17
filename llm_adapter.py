from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

try:
    from google import genai
except Exception:  # genai may not be available in some environments
    genai = None


class LLMAdapter(ABC):
    """Abstract base class for LLM adapters.

    Implementations must provide `generate(prompt, temperature, include_thoughts)` and set
    `name` and `model_name` attributes for identification.
    """

    def __init__(self, model_name: str | None = None, name: str | None = None) -> None:
        self.model_name = model_name or name or self.__class__.__name__
        self.name = name or self.model_name

    @abstractmethod
    def generate(
        self,
        prompt: str,
        temperature: float = 0.0,
        include_thoughts: bool = True,
    ) -> tuple[str, str]:
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

    def generate(
        self,
        prompt: str,
        temperature: float = 0.0,
        include_thoughts: bool = True,
    ) -> tuple[str, str]:
        # Keep provider-specific response parsing inside the adapter.
        from google.genai import types

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(include_thoughts=include_thoughts),
                temperature=temperature,
            ),
        )

        parts = []
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            parts = response.candidates[0].content.parts

        response_parts: list[str] = []
        thought_parts: list[str] = []
        for part in parts:
            text = getattr(part, "text", None)
            if not text:
                continue
            if getattr(part, "thought", False):
                thought_parts.append(text)
            else:
                response_parts.append(text)

        response_text = "\n".join(response_parts).strip()
        thinking_text = "\n".join(thought_parts).strip()
        return response_text, thinking_text

if __name__ == "__main__":
    # Example usage (requires valid API key and network access):
    # adapter = GeminiAdapter(api_key="your_api_key_here")
    try:
        import os
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        adapter = GeminiAdapter(api_key=api_key)
        response, thoughts = adapter.generate("What is the capital of France?", temperature=0.5)
        print("Response:", response)
        print("Thoughts:", thoughts)
    except Exception as e:
        print(f"Error during example usage: {e}")
        print("Make sure to set the GOOGLE_API_KEY environment variable and have network access.")