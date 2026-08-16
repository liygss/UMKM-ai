"""Schema untuk endpoint chatbot (RAG)."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.database.models import ChatRole


class ChatRequest(BaseModel):
    session_id: str | None = None  # None = mulai sesi baru
    message: str


class RetrievedSource(BaseModel):
    chunk_id: str
    content_snippet: str
    score: float
    source_filename: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: list[RetrievedSource] = []
    has_financial_data: bool = False  # True jika jawaban menggunakan data keuangan user


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: ChatRole
    content: str
    created_at: datetime
