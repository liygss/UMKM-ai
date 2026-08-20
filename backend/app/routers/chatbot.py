"""Router chatbot: tanya jawab akuntansi & pajak berbasis RAG + Ollama."""

import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.database import get_db
from app.database.models import User
from app.llm.ollama_service import OllamaError
from app.middleware.auth import require_active_user
from app.rag.rag_pipeline import ask
from app.schemas.chatbot_schema import ChatRequest, ChatResponse, RetrievedSource
from app.services.data_context_service import get_financial_context

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
logger = get_logger(__name__)

CHATBOT_TIMEOUT_SECONDS = 60


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "module": "chatbot"}


@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> ChatResponse:
    try:
        # Hitung financial context sekali saja
        financial_context = get_financial_context(db, current_user.id, payload.message)
        has_financial_data = financial_context is not None

        # Jalankan RAG pipeline dengan timeout
        hasil = await asyncio.wait_for(
            asyncio.to_thread(
                ask,
                db,
                current_user.id,
                payload.session_id,
                payload.message,
                financial_context,
            ),
            timeout=CHATBOT_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Chatbot terlalu lama merespons. Silakan coba lagi nanti.",
        )
    except OllamaError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Layanan LLM (Ollama) sedang tidak bisa diakses. Pastikan server "
                f"Ollama berjalan. Detail: {exc}"
            ),
        ) from exc

    return ChatResponse(
        session_id=hasil.session_id,
        answer=hasil.answer,
        sources=[
            RetrievedSource(
                chunk_id=s.qdrant_point_id,
                content_snippet=s.content[:200],
                score=s.score,
                source_filename=s.source_filename,
            )
            for s in hasil.sources
        ],
        has_financial_data=has_financial_data,
    )
