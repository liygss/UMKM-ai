"""
Router SPT Tahunan PPh Orang Pribadi (Formulir 1770 / 1770S).

Menyediakan CRUD untuk data formulir SPT per user, plus endpoint hitung
(preview perhitungan PPh sebelum disimpan/dicetak).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.accounting import spt_engine
from app.config.logging import get_logger
from app.database.database import get_db
from app.database.models import SptTahunan, User
from app.middleware.auth import require_active_user
from app.schemas.spt_schema import (
    SptCreate,
    SptHitungRequest,
    SptHitungResponse,
    SptListResponse,
    SptResponse,
    SptUpdate,
)

router = APIRouter(prefix="/spt", tags=["SPT"])
logger = get_logger(__name__)


def _to_response(record: SptTahunan) -> SptResponse:
    return SptResponse(
        id=str(record.id),
        form_type=record.form_type,
        tahun_pajak=record.tahun_pajak,
        status=record.status,
        data=record.data or {},
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.post("", response_model=SptResponse, status_code=status.HTTP_201_CREATED)
def create_spt(
    payload: SptCreate,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> SptResponse:
    """Simpan SPT baru (draft) untuk user yang sedang login."""
    record = SptTahunan(
        user_id=str(current_user.id),
        form_type=payload.form_type,
        tahun_pajak=payload.tahun_pajak,
        status=payload.status,
        data=payload.data.model_dump(mode="json"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    logger.info("User %s membuat SPT %s tahun %s", current_user.id, payload.form_type, payload.tahun_pajak)
    return _to_response(record)


@router.get("", response_model=SptListResponse)
def list_spt(
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> SptListResponse:
    """Daftar SPT milik user yang sedang login (terbaru dulu)."""
    records = (
        db.query(SptTahunan)
        .filter(SptTahunan.user_id == str(current_user.id))
        .order_by(SptTahunan.updated_at.desc())
        .all()
    )
    return SptListResponse(items=[_to_response(r) for r in records])


@router.get("/{spt_id}", response_model=SptResponse)
def get_spt(
    spt_id: str,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> SptResponse:
    """Ambil detail satu SPT milik user yang sedang login."""
    record = (
        db.query(SptTahunan)
        .filter(
            SptTahunan.id == spt_id,
            SptTahunan.user_id == str(current_user.id),
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SPT tidak ditemukan")
    return _to_response(record)


@router.put("/{spt_id}", response_model=SptResponse)
def update_spt(
    spt_id: str,
    payload: SptUpdate,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> SptResponse:
    """Perbarui data / status SPT milik user yang sedang login."""
    record = (
        db.query(SptTahunan)
        .filter(
            SptTahunan.id == spt_id,
            SptTahunan.user_id == str(current_user.id),
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SPT tidak ditemukan")

    if payload.status is not None:
        record.status = payload.status
    if payload.data is not None:
        record.data = payload.data.model_dump(mode="json")
        record.form_type = record.data.get("identitas", {}).get("jenis_form", record.form_type)
        record.tahun_pajak = int(record.data.get("identitas", {}).get("tahun_pajak") or record.tahun_pajak)

    db.commit()
    db.refresh(record)
    return _to_response(record)


@router.delete("/{spt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_spt(
    spt_id: str,
    current_user: User = Depends(require_active_user),
    db: Session = Depends(get_db),
) -> None:
    """Hapus SPT milik user yang sedang login."""
    record = (
        db.query(SptTahunan)
        .filter(
            SptTahunan.id == spt_id,
            SptTahunan.user_id == str(current_user.id),
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SPT tidak ditemukan")
    db.delete(record)
    db.commit()


@router.post("/hitung", response_model=SptHitungResponse)
def hitung_spt(
    payload: SptHitungRequest,
    current_user: User = Depends(require_active_user),
) -> SptHitungResponse:
    """Preview perhitungan PPh dari data form yang sedang diisi (tanpa menyimpan)."""
    result = spt_engine.hitung_spt(
        payload.data.model_dump(mode="json"),
        form_type=payload.form_type,
    )
    return SptHitungResponse(
        form_type=result.form_type,
        tahun_pajak=result.tahun_pajak,
        angka_1=result.angka_1,
        angka_2=result.angka_2,
        angka_3=result.angka_3,
        angka_4=result.angka_4,
        angka_5=result.angka_5,
        angka_6=result.angka_6,
        angka_7=result.angka_7,
        angka_8=result.angka_8,
        angka_9=result.angka_9,
        angka_10=result.angka_10,
        angka_11=result.angka_11,
        angka_12=result.angka_12,
        angka_13=result.angka_13,
        angka_14=result.angka_14,
        angka_15=result.angka_15,
        angka_16=result.angka_16,
        angka_17=result.angka_17,
        angka_18=result.angka_18,
        angka_19a=result.angka_19a,
        angka_19b=result.angka_19b,
        angka_21=result.angka_21,
        pengembalian_pph_24=result.pengembalian_pph_24,
        jumlah_pph_terutang=result.jumlah_pph_terutang,
        pph_lebih_dipotong=result.pph_lebih_dipotong,
        stp_pph_25=result.stp_pph_25,
        jumlah_kredit_pph_25=result.jumlah_kredit_pph_25,
        ptkp_detail=result.ptkp_detail.__dict__,
        pph_pasal_17_detail=result.pph_pasal_17_detail.__dict__,
        catatan=result.catatan,
    )
