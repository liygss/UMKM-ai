"""Schema untuk SPT Tahunan PPh Orang Pribadi (Formulir 1770 / 1770S)."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, ValidationInfo


# ---------------------------------------------------------------------------
# Mixin: coerce None / "" / string-numerik pada field int/float -> 0.
#
# Tanpa mixin ini, frontend yang mengirim `NaN` (yang JSON.stringify jadi
# `null`) atau `""` ke field float/int akan ditolak Pydantic (422), sehingga
# UI menampilkan "Gagal menghitung" tanpa pesan yang jelas.
# ---------------------------------------------------------------------------
class _NumCoerceModel(BaseModel):
    @field_validator("*", mode="before")
    @classmethod
    def _coerce_numeric_field(cls, v: object, info: ValidationInfo):
        finfo = cls.model_fields.get(info.field_name) if info.field_name else None
        if finfo is None or finfo.annotation not in (int, float):
            return v
        if v is None:
            return 0
        if isinstance(v, str):
            if v.strip() == "":
                return 0
            try:
                return int(v) if finfo.annotation is int else float(v)
            except ValueError:
                return 0
        return v


class IdentitasForm(_NumCoerceModel):
    npwp: str = ""
    nama: str = ""
    jenis_usaha: str = ""
    pekerjaan_utama: str = ""
    klu: str = ""
    no_telepon: str = ""
    no_faks: str = ""
    status_kawin: str = "KK"  # KK / HB / PH / MT
    npwp_pasangan: str = ""
    alamat: str = ""
    kelurahan_kecamatan: str = ""
    pembetulan_ke: int = 0
    tahun_pajak: int = Field(default_factory=lambda: datetime.now().year - 1)
    jenis_form: str = "1770"  # 1770 / 1770S


class PenghasilanUsahaPembukuan(_NumCoerceModel):
    peredaran_usaha: float = 0
    hpp: float = 0
    laba_rugi_bruto: float = 0
    biaya_usaha: float = 0
    penghasilan_neto_komersial: float = 0
    penyesuaian_positif: dict = Field(default_factory=dict)
    jumlah_penyesuaian_positif: float = 0
    penyesuaian_negatif: dict = Field(default_factory=dict)
    jumlah_penyesuaian_negatif: float = 0


class PenghasilanUsahaPencatatan(_NumCoerceModel):
    jenis_usaha: str = ""
    norma_persen: float = 0
    peredaran_usaha: float = 0


class PenghasilanNeto(_NumCoerceModel):
    """Struktur bagian 'penghasilan' pada form SPT."""

    metode: str = "pembukuan"  # pembukuan / pencatatan
    usaha: PenghasilanUsahaPembukuan = PenghasilanUsahaPembukuan()
    usaha_pencatatan: PenghasilanUsahaPencatatan = PenghasilanUsahaPencatatan()
    pekerjaan: list[dict] = Field(default_factory=list)  # [{nama_pemberi_kerja, npwp_pemberi_kerja, penghasilan_neto}]
    dalam_negeri_lainnya: list[dict] = Field(default_factory=list)  # [{jenis, penghasilan_bruto, penghasilan_neto}]
    bukan_objek: list[dict] = Field(default_factory=list)  # [{jenis, jumlah}] penghasilan yang tidak termasuk objek pajak
    luar_negeri: float = 0
    zakat: float = 0
    kompensasi_kerugian: float = 0
    pengembalian_pph_24: float = 0  # PENGEMBALIAN/PENGURANGAN PPh PASAL 24 YANG TELAH DIKREDITKAN
    final: list[dict] = Field(default_factory=list)  # [{jenis, dasar_pengenaan, pph_terutang}]


class KreditPajakForm(_NumCoerceModel):
    dalam_negeri: float = 0  # kredit pajak PPh 24
    pemotongan: list[dict] = Field(default_factory=list)  # [{nama, npwp, jenis, no_bukti, tanggal, jumlah}]
    pph_dibayar_sendiri_25: float = 0  # jumlah PPh 25 yang telah dibayar
    stp_pph_25: float = 0  # STP PPh Pasal 25 (hanya pokok pajak)


class HartaForm(_NumCoerceModel):
    kode: str = ""
    nama: str = ""
    tahun_perolehan: int = 0
    harga_perolehan: float = 0
    keterangan: str = ""


class UtangForm(_NumCoerceModel):
    kode: str = ""
    nama_pemberi: str = ""
    alamat_pemberi: str = ""
    tahun_peminjaman: int = 0
    jumlah: float = 0


class TanggunganForm(BaseModel):
    nama: str = ""
    nik: str = ""
    hubungan: str = ""
    pekerjaan: str = ""


class PermohonanForm(BaseModel):
    restitusi: str = ""  # SKPPKP_17C / SKPPKP_17D / kompensasi
    angsuran_25: str = "1_12"  # 1_12 / separate


class SptData(BaseModel):
    identitas: IdentitasForm = IdentitasForm()
    penghasilan: PenghasilanNeto = PenghasilanNeto()
    kredit_pajak: KreditPajakForm = KreditPajakForm()
    harta: list[HartaForm] = Field(default_factory=list)
    utang: list[UtangForm] = Field(default_factory=list)
    tanggungan: list[TanggunganForm] = Field(default_factory=list)
    permohonan: PermohonanForm = PermohonanForm()


class SptBase(BaseModel):
    form_type: str = "1770"
    tahun_pajak: int = Field(default_factory=lambda: datetime.now().year - 1)
    status: str = "DRAFT"


class SptCreate(BaseModel):
    form_type: str = "1770"
    tahun_pajak: int = Field(default_factory=lambda: datetime.now().year - 1)
    status: str = "DRAFT"
    data: SptData = SptData()

    @field_validator("form_type", mode="after")
    @classmethod
    def validate_form_type(cls, v: str) -> str:
        if v not in ("1770", "1770S"):
            raise ValueError("form_type harus '1770' atau '1770S'")
        return v

    @field_validator("tahun_pajak", mode="after")
    @classmethod
    def validate_tahun_pajak(cls, v: int) -> int:
        current_year = datetime.now().year
        if not (2000 <= v <= current_year + 1):
            raise ValueError(f"tahun_pajak harus antara 2000 dan {current_year + 1}")
        return v


class SptUpdate(BaseModel):
    status: str | None = None
    data: SptData | None = None

    @field_validator("status", mode="after")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None and v not in ("DRAFT", "FINAL"):
            raise ValueError("status harus 'DRAFT' atau 'FINAL'")
        return v


class SptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    form_type: str
    tahun_pajak: int
    status: str
    data: dict
    created_at: datetime
    updated_at: datetime


class SptListResponse(BaseModel):
    items: list[SptResponse]


class SptHitungRequest(BaseModel):
    data: SptData = SptData()
    form_type: str = "1770"


class PtkpDetailResponse(BaseModel):
    status: str
    jumlah_tanggungan: int
    nilai_ptkp: float
    uraian: str


class Pph17LapisanResponse(BaseModel):
    lapisan: str
    dasar: float
    tarif: float
    pph: float


class PphPasal17DetailResponse(BaseModel):
    pkp: float
    pph_terutang: float
    rincian: list[Pph17LapisanResponse] = []


class SptHitungResponse(BaseModel):
    form_type: str
    tahun_pajak: int
    angka_1: float
    angka_2: float
    angka_3: float
    angka_4: float
    angka_5: float
    angka_6: float
    angka_7: float
    angka_8: float
    angka_9: float
    angka_10: float
    angka_11: float
    angka_12: float
    angka_13: float
    angka_14: float
    angka_15: float
    angka_16: float
    angka_17: float
    angka_18: float
    angka_19a: float
    angka_19b: float
    angka_21: float
    pengembalian_pph_24: float
    jumlah_pph_terutang: float
    pph_lebih_dipotong: float
    stp_pph_25: float
    jumlah_kredit_pph_25: float
    ptkp_detail: PtkpDetailResponse
    pph_pasal_17_detail: PphPasal17DetailResponse
    catatan: list[str] = []
