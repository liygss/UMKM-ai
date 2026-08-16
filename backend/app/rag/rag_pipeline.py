"""
Orkestrator RAG penuh: retrieve -> rerank -> context -> prompt -> LLM -> parse.
Juga mengurus penyimpanan/pengambilan histori chat (ChatSession/ChatMessage)
supaya chatbot punya "ingatan" percakapan dalam satu sesi.
"""

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.models import ChatMessage, ChatRole, ChatSession
from app.llm.ollama_service import chat_completion
from app.llm.response_parser import parse_llm_response
from app.rag.context_builder import build_context
from app.rag.prompt_builder import build_messages
from app.rag.reranker import rerank
from app.rag.retriever import RetrievedChunk, retrieve
from app.services.data_context_service import get_financial_context

logger = get_logger(__name__)

MAX_HISTORY_MESSAGES = 6  # jumlah pesan terakhir yang dibawa sebagai konteks percakapan
RETRIEVAL_TOP_K = 8       # ambil agak banyak dulu dari Qdrant
RERANK_TOP_N = 4          # baru dipangkas ke yang paling relevan setelah rerank


@dataclass
class RagAnswer:
    session_id: str
    answer: str
    sources: list[RetrievedChunk]


def _get_or_create_session(db: Session, user_id: str, session_id: str | None) -> ChatSession:
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if session:
            return session
    session = ChatSession(user_id=user_id, title="Percakapan baru")
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def _ambil_histori(db: Session, session: ChatSession) -> list[dict[str, str]]:
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    messages.reverse()
    return [{"role": m.role.value.lower(), "content": m.content} for m in messages]


def ask(db: Session, user_id: str, session_id: str | None, pertanyaan: str) -> RagAnswer:
    session = _get_or_create_session(db, user_id, session_id)
    histori = _ambil_histori(db, session)

    # 1. Retrieve (knowledge base dari Qdrant)
    retrieved = retrieve(pertanyaan, top_k=RETRIEVAL_TOP_K)

    # 2. Rerank
    reranked = rerank(pertanyaan, retrieved, top_n=RERANK_TOP_N)

    # 3. Context (knowledge base)
    context = build_context(reranked)

    # 3b. Financial context (data keuangan user dari PostgreSQL)
    financial_context = get_financial_context(db, user_id, pertanyaan)

    # 4. Prompt (gabungkan knowledge base + financial context)
    messages = build_messages(pertanyaan, context, histori, financial_context)

    # 5. LLM
    raw_answer = chat_completion(messages)

    # 6. Parse
    parsed = parse_llm_response(raw_answer)

    # Simpan histori (pertanyaan user + jawaban asisten)
    db.add(ChatMessage(session_id=session.id, role=ChatRole.USER, content=pertanyaan))
    db.add(
        ChatMessage(
            session_id=session.id,
            role=ChatRole.ASSISTANT,
            content=parsed.answer,
            retrieved_chunk_ids=",".join(c.qdrant_point_id for c in context.sources),
        )
    )
    db.commit()

    logger.info(
        "RAG answer untuk sesi %s: %d chunk (knowledge) + financial_data=%s.",
        session.id,
        len(context.sources),
        "yes" if financial_context else "no",
    )

    return RagAnswer(session_id=session.id, answer=parsed.answer, sources=context.sources)
