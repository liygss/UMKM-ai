"""
ORM models.
Skema disusun mengikuti alur akuntansi SAK EMKM:
    Transaksi -> Jurnal Umum -> Buku Besar (turunan) -> Neraca Saldo (turunan)
    -> Jurnal Penyesuaian -> Laporan Keuangan (turunan)

Buku Besar dan Neraca Saldo sengaja TIDAK punya tabel sendiri karena keduanya
adalah hasil agregasi dari JurnalDetail (dihitung on the fly di
app/accounting/buku_besar.py dan neraca_saldo.py). Ini menghindari duplikasi
data dan potensi tidak sinkron antara jurnal dan laporan turunannya.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class KategoriAkun(str, enum.Enum):
    ASET = "ASET"
    LIABILITAS = "LIABILITAS"
    MODAL = "MODAL"
    PENDAPATAN = "PENDAPATAN"
    BEBAN = "BEBAN"


class SaldoNormal(str, enum.Enum):
    DEBIT = "DEBIT"
    KREDIT = "KREDIT"


class JenisJurnal(str, enum.Enum):
    UMUM = "UMUM"                # jurnal transaksi harian
    PENYESUAIAN = "PENYESUAIAN"  # jurnal penyesuaian akhir periode
    PENUTUP = "PENUTUP"          # jurnal penutup


class StatusUpload(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    NORMALIZED = "NORMALIZED"
    INGESTED = "INGESTED"        # sudah masuk ke vector store (untuk pdf/aturan)
    POSTED = "POSTED"            # sudah jadi jurnal (untuk csv/xlsx transaksi)
    FAILED = "FAILED"


class RoleUser(str, enum.Enum):
    ADMIN = "ADMIN"
    OWNER = "OWNER"       # pemilik UMKM
    STAFF = "STAFF"


class ChatRole(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"


# ---------------------------------------------------------------------------
# User & Auth
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleUser] = mapped_column(Enum(RoleUser), default=RoleUser.OWNER)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    jurnal_entries: Mapped[list["JurnalUmum"]] = relationship(back_populates="created_by")
    uploaded_files: Mapped[list["UploadedFile"]] = relationship(back_populates="uploaded_by")
    chat_sessions: Mapped[list["ChatSession"]] = relationship(back_populates="user")
    spt_records: Mapped[list["SptTahunan"]] = relationship(back_populates="user")


# ---------------------------------------------------------------------------
# Chart of Accounts (Akun)
# ---------------------------------------------------------------------------
class Akun(Base):
    """Daftar akun / Chart of Accounts sesuai SAK EMKM."""

    __tablename__ = "akun"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    kode_akun: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    nama_akun: Mapped[str] = mapped_column(String(150), nullable=False)
    kategori: Mapped[KategoriAkun] = mapped_column(Enum(KategoriAkun), nullable=False)
    sub_kategori: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # contoh sub_kategori: "Aset Lancar", "Aset Tetap", "Liabilitas Jangka Pendek", dst.
    saldo_normal: Mapped[SaldoNormal] = mapped_column(Enum(SaldoNormal), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    deskripsi: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    detail_jurnal: Mapped[list["JurnalDetail"]] = relationship(back_populates="akun")

    def __repr__(self) -> str:
        return f"<Akun {self.kode_akun} - {self.nama_akun}>"


# ---------------------------------------------------------------------------
# Jurnal Umum (header) & Jurnal Detail (baris debit/kredit)
# ---------------------------------------------------------------------------
class JurnalUmum(Base):
    """Header transaksi jurnal. Satu jurnal punya >= 2 baris JurnalDetail."""

    __tablename__ = "jurnal_umum"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    no_bukti: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    tanggal: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    deskripsi: Mapped[str] = mapped_column(Text, nullable=False)
    jenis: Mapped[JenisJurnal] = mapped_column(Enum(JenisJurnal), default=JenisJurnal.UMUM)

    # referensi ke sumber data (upload csv/xlsx), nullable karena bisa juga input manual
    sumber_upload_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("uploaded_files.id"), nullable=True
    )

    created_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    created_by: Mapped["User"] = relationship(back_populates="jurnal_entries")

    is_locked: Mapped[bool] = mapped_column(
        Boolean, default=False
    )  # dikunci setelah dipakai untuk menyusun laporan periode tertentu
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    detail: Mapped[list["JurnalDetail"]] = relationship(
        back_populates="jurnal", cascade="all, delete-orphan", order_by="JurnalDetail.urutan"
    )
    sumber_upload: Mapped["UploadedFile | None"] = relationship(back_populates="jurnal_entries")

    def total_debit(self) -> float:
        return sum(float(d.debit) for d in self.detail)

    def total_kredit(self) -> float:
        return sum(float(d.kredit) for d in self.detail)

    def is_balanced(self) -> bool:
        return round(self.total_debit(), 2) == round(self.total_kredit(), 2)


class JurnalDetail(Base):
    """Baris debit/kredit pada satu jurnal. Tepat satu dari debit/kredit yang > 0."""

    __tablename__ = "jurnal_detail"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    jurnal_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jurnal_umum.id", ondelete="CASCADE")
    )
    akun_id: Mapped[str] = mapped_column(String(36), ForeignKey("akun.id"))
    urutan: Mapped[int] = mapped_column(default=0)  # urutan baris dalam 1 jurnal
    debit: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    kredit: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    keterangan: Mapped[str | None] = mapped_column(String(255), nullable=True)

    jurnal: Mapped["JurnalUmum"] = relationship(back_populates="detail")
    akun: Mapped["Akun"] = relationship(back_populates="detail_jurnal")


# ---------------------------------------------------------------------------
# Upload & Ingestion tracking
# ---------------------------------------------------------------------------
class UploadedFile(Base):
    """
    Metadata file yang diupload user.
    - csv/xlsx transaksi -> diproses jadi JurnalUmum (lihat services/ingestion)
    - pdf aturan/kebijakan -> diproses jadi DocumentChunk untuk RAG
    """

    __tablename__ = "uploaded_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)  # csv | xlsx | pdf
    file_size_bytes: Mapped[int] = mapped_column(default=0)
    status: Mapped[StatusUpload] = mapped_column(Enum(StatusUpload), default=StatusUpload.UPLOADED)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    uploaded_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    uploaded_by: Mapped["User"] = relationship(back_populates="uploaded_files")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    jurnal_entries: Mapped[list["JurnalUmum"]] = relationship(back_populates="sumber_upload")
    chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="source_file")


class DocumentChunk(Base):
    """
    Metadata chunk teks yang embedding-nya disimpan di Qdrant.
    Tabel ini menyimpan teks asli + referensi qdrant_point_id supaya
    hasil retrieval bisa ditelusuri balik ke sumber dokumennya.
    """

    __tablename__ = "document_chunks"
    __table_args__ = (UniqueConstraint("source_file_id", "chunk_index", name="uq_chunk_per_file"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    source_file_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("uploaded_files.id", ondelete="CASCADE")
    )
    chunk_index: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    qdrant_point_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    token_count: Mapped[int | None] = mapped_column(nullable=True)
    extra_metadata: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    source_file: Mapped["UploadedFile"] = relationship(back_populates="chunks")


# ---------------------------------------------------------------------------
# Chatbot history
# ---------------------------------------------------------------------------
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255), default="Percakapan baru")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )


# ---------------------------------------------------------------------------
# SPT Tahunan (Formulir 1770 / 1770S)
# ---------------------------------------------------------------------------
class SptTahunan(Base):
    __tablename__ = "spt_tahunan"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    form_type: Mapped[str] = mapped_column(String(10), nullable=False)  # "1770" atau "1770S"
    tahun_pajak: Mapped[int] = mapped_column(nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")  # DRAFT, FINAL
    data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="spt_records")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE")
    )
    role: Mapped[ChatRole] = mapped_column(Enum(ChatRole), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # daftar chunk yang dipakai sebagai konteks jawaban (untuk sitasi di frontend)
    retrieved_chunk_ids: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["ChatSession"] = relationship(back_populates="messages")
