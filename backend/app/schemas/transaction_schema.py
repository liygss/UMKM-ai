"""Schema untuk Akun (Chart of Accounts) dan Jurnal Umum."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.database.models import KategoriAkun, SaldoNormal


class AkunBase(BaseModel):
    kode_akun: str
    nama_akun: str
    kategori: KategoriAkun
    sub_kategori: str | None = None
    saldo_normal: SaldoNormal


class AkunCreate(AkunBase):
    pass


class AkunResponse(AkunBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_active: bool
    created_at: datetime


class JurnalDetailInput(BaseModel):
    kode_akun: str
    debit: float = 0
    kredit: float = 0
    keterangan: str | None = None

    @field_validator("debit", "kredit")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Nilai debit/kredit tidak boleh negatif")
        return v


class JurnalUmumCreate(BaseModel):
    no_bukti: str
    tanggal: date
    deskripsi: str
    detail: list[JurnalDetailInput]

    @field_validator("detail")
    @classmethod
    def minimal_dua_baris_dan_balance(
        cls, v: list[JurnalDetailInput]
    ) -> list[JurnalDetailInput]:
        if len(v) < 2:
            raise ValueError("Jurnal minimal harus punya 2 baris (debit dan kredit)")
        total_debit = round(sum(d.debit for d in v), 2)
        total_kredit = round(sum(d.kredit for d in v), 2)
        if total_debit != total_kredit:
            raise ValueError(
                f"Jurnal tidak balance: total debit ({total_debit}) "
                f"!= total kredit ({total_kredit})"
            )
        return v


class JurnalDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kode_akun: str = ""
    nama_akun: str = ""
    debit: float
    kredit: float
    keterangan: str | None = None


class JurnalUmumResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    no_bukti: str
    tanggal: date
    deskripsi: str
    detail: list[JurnalDetailResponse]
    created_at: datetime
