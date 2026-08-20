"""
Wrapper tipis di atas library `ollama` untuk chat completion.

Mendukung dua mode:
- Cloud (Ollama Cloud / ollama.com): otomatis aktif kalau OLLAMA_API_KEY di-set.
  Client mengirim header Authorization: Bearer <key> ke OLLAMA_BASE_URL.
- Lokal: OLLAMA_API_KEY kosong, base URL menunjuk ke http://localhost:11434.

Embedding TIDAK lewat service ini lagi — pindah ke app/llm/embedding_service.py
(karena Ollama Cloud tidak mendukung model embedding, dan embedding lokal via
fastembed lebih cocok untuk aplikasi desktop).
"""

import threading

from ollama import Client
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)

_client: Client | None = None
_client_lock = threading.Lock()


def get_client() -> Client:
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:
                headers = {}
                if settings.ollama_is_cloud:
                    headers["Authorization"] = f"Bearer {settings.OLLAMA_API_KEY}"
                _client = Client(
                    host=str(settings.OLLAMA_BASE_URL),
                    timeout=settings.OLLAMA_TIMEOUT,
                    headers=headers,
                )
    return _client


class OllamaError(Exception):
    pass


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=8))
def chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.2,
) -> str:
    """
    messages: list of {"role": "system"|"user"|"assistant", "content": "..."}
    temperature rendah (0.2) dipakai default karena ini use case akuntansi/pajak
    yang butuh jawaban konsisten & tidak terlalu "kreatif".
    """
    try:
        client = get_client()
        response = client.chat(
            model=model or settings.OLLAMA_MODEL,
            messages=messages,
            options={"temperature": temperature},
        )
        return response["message"]["content"]
    except Exception as exc:  # noqa: BLE001
        logger.error("Gagal mendapatkan chat completion dari Ollama: %s", exc)
        raise OllamaError(f"Gagal menghasilkan jawaban: {exc}") from exc


def check_ollama_available() -> bool:
    try:
        get_client().list()
        return True
    except Exception:  # noqa: BLE001
        return False
