"""Tes untuk prompt chatbot: prompt umum + konteks halaman aktif + boosting pajak."""

from app.llm.prompt_template import get_system_prompt
from app.rag.context_builder import build_context
from app.rag.prompt_builder import build_messages, detect_domain
from app.rag.rag_pipeline import merge_chunks
from app.rag.retriever import RetrievedChunk
from app.schemas.chatbot_schema import ChatRequest


def _empty_context():
    return build_context([])


def _chunk(pid: str) -> RetrievedChunk:
    return RetrievedChunk(
        qdrant_point_id=pid,
        score=1.0,
        content="isi",
        heading=None,
        source_filename="x.md",
        source_file_id="f",
        category="tax",
    )


def test_system_prompt_memungkinkan_jawaban_umum():
    prompt = get_system_prompt().lower()
    assert "asisten finora" in prompt
    # boleh menjawab pertanyaan umum, bukan hanya dari konteks
    assert "pertanyaan umum" in prompt
    # tidak lagi melarang tegas "jawab hanya berdasarkan konteks"
    assert "jawab hanya berdasarkan konteks" not in prompt


def test_build_messages_termasuk_lokasi_halaman():
    messages = build_messages("cara input jurnal?", _empty_context(), [], None, page="Jurnal Umum")
    system = messages[0]["content"]
    assert "Lokasi pengguna saat ini: halaman Jurnal Umum" in system
    assert messages[-1]["role"] == "user"
    assert messages[-1]["content"] == "cara input jurnal?"


def test_build_messages_tanpa_page_tidak_menambah_lokasi():
    messages = build_messages("halo", _empty_context(), [], None, page=None)
    assert "Lokasi pengguna saat ini" not in messages[0]["content"]


def test_build_messages_tanpa_konteks_mengarahkan_jawaban_umum():
    messages = build_messages("jelaskan apa itu inflasi", _empty_context())
    system = messages[0]["content"]
    assert "pengetahuan umummu" in system
    assert "katakan terus terang bahwa informasinya tidak tersedia" not in system


def test_chat_request_menerima_page():
    req = ChatRequest(message="halo", page="Dashboard")
    assert req.page == "Dashboard"
    assert req.session_id is None


def test_detect_domain_pajak():
    assert detect_domain("Isi SPT 1770 apa saja?") == "tax"
    assert detect_domain("Berapa tarif PPN 12%?") == "tax"
    assert detect_domain("cara buat id billing") == "tax"


def test_detect_domain_akuntansi():
    assert detect_domain("cara membuat jurnal penjualan") == "accounting"
    assert detect_domain("apa itu neraca saldo") == "accounting"


def test_detect_domain_umum():
    assert detect_domain("jelaskan apa itu inflasi") == ""


def test_merge_chunks_dedupe():
    gabungan = merge_chunks([_chunk("a"), _chunk("b")], [_chunk("b"), _chunk("c")])
    ids = [c.qdrant_point_id for c in gabungan]
    assert ids == ["a", "b", "c"]
