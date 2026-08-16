"""
Engine perhitungan SPT Tahunan PPh Orang Pribadi (Formulir 1770 & 1770S).

PENTING: modul ini adalah alat bantu hitung berdasarkan aturan umum yang
berlaku (per pengecekan terakhir, 2026). Aturan pajak bisa berubah sewaktu-waktu
lewat PMK/Peraturan Dirjen baru. Selalu validasi ke konsultan pajak atau situs
resmi DJP (pajak.go.id) sebelum dipakai untuk pelaporan resmi.

Referensi utama:
- UU No. 7/2021 (UU HPP)
- PMK No. 101/2024 tentang penyesuaian besaran PTKP
- PP No. 55/2022 tentang PPh atas penghasilan usaha WP dengan peredaran bruto
  tertentu (PPh Final UMKM)
"""

from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Konstanta
# ---------------------------------------------------------------------------
# PTKP (per PMK No. 101/2024, berlaku sejak tahun pajak 2024)
PTKP_WAJIB_PAJAK_LAJANG = 54_000_000  # Rp54 juta / tahun
PTKP_TAMBAHAN_TANGGUNGAN = 4_500_000  # Rp4,5 juta per tanggungan (maks 3)
PTKP_TAMBAHAN_STATUS_KAWIN = 4_500_000  # Rp4,5 juta untuk status kawin (K)

# Tarif PPh Pasal 17 (UU HPP): lapisan, tarif
TARIF_PASAL_17 = [
    (60_000_000, 0.05),
    (250_000_000, 0.15),
    (500_000_000, 0.25),
    (5_000_000_000, 0.30),
    (float("inf"), 0.35),
]

# Status perkawinan
STATUS_KK = "KK"  # Kawin, kewajiban digabung (kepala keluarga)
STATUS_HB = "HB"  # Kawin, hidup berpisah (berdasarkan putusan pengadilan)
STATUS_PH = "PH"  # Kawin, pisah harta dan penghasilan
STATUS_MT = "MT"  # Kawin, istri memilih kewajiban terpisah


@dataclass
class HasilPTKP:
    status: str
    jumlah_tanggungan: int
    nilai_ptkp: float
    uraian: str


@dataclass
class HasilPPhPasal17:
    pkp: float
    pph_terutang: float
    rincian: list[dict] = field(default_factory=list)


@dataclass
class HasilSPT:
    form_type: str
    tahun_pajak: int

    # Alur Formulir Induk
    angka_1: float  # Penghasilan neto dari usaha/pekerjaan bebas
    angka_2: float  # Penghasilan neto dari pekerjaan
    angka_3: float  # Penghasilan neto dalam negeri lainnya
    angka_4: float  # Penghasilan neto luar negeri
    angka_5: float  # Jumlah penghasilan neto
    angka_6: float  # Zakat/sumbangan keagamaan wajib
    angka_7: float  # Jumlah penghasilan neto setelah zakat
    angka_8: float  # Kompensasi kerugian
    angka_9: float  # Jumlah penghasilan neto
    angka_10: float  # PTKP
    angka_11: float  # Penghasilan Kena Pajak (PKP)
    angka_12: float  # PPh terutang (Pasal 17)
    angka_13: float  # Kredit pajak dari dalam negeri (PPh 24)
    angka_14: float  # PPh dipotong pihak lain (21/22/23/26/DTP)
    angka_15: float  # Jumlah kredit pajak (13+14)
    angka_16: float  # PPh terutang (12-15)
    angka_17: float  # PPh dibayar sendiri (Pasal 25)
    angka_18: float  # Selisih (16-17)
    angka_19a: float  # PPh kurang bayar (Pasal 29)
    angka_19b: float  # PPh lebih bayar (28A)
    angka_21: float  # Angsuran PPh 25 tahun berikutnya

    # Nilai turunan sesuai alur Formulir Induk resmi
    pengembalian_pph_24: float  # 1770 angka 13 / 1770S angka 10
    jumlah_pph_terutang: float  # 1770 angka 14 / 1770S angka 11 (12 + pengembalian_pph_24)
    pph_lebih_dipotong: float  # 1770 angka 16b / 1770S angka 13b
    stp_pph_25: float  # 1770 angka 17b / 1770S angka 14b
    jumlah_kredit_pph_25: float  # 1770 angka 18 / 1770S angka 15 (17a + 17b)

    ptkp_detail: HasilPTKP
    pph_pasal_17_detail: HasilPPhPasal17
    catatan: list[str] = field(default_factory=list)


def hitung_ptkp(status: str, jumlah_tanggungan: int) -> HasilPTKP:
    """
    Menghitung Penghasilan Tidak Kena Pajak (PTKP).

    - TK (Tidak Kawin) / PH / MT: Rp54 jt + Rp4,5 jt per tanggungan (maks 3)
    - K (Kawin) / KK / HB: Rp54 jt + Rp4,5 jt (tambahan kawin) + Rp4,5 jt
      per tanggungan (maks 3)
    """
    tanggungan = max(0, min(jumlah_tanggungan or 0, 3))

    if status in (STATUS_KK, STATUS_HB, "K"):
        nilai = (
            PTKP_WAJIB_PAJAK_LAJANG
            + PTKP_TAMBAHAN_STATUS_KAWIN
            + PTKP_TAMBAHAN_TANGGUNGAN * tanggungan
        )
        label = "Kawin"
    else:
        nilai = PTKP_WAJIB_PAJAK_LAJANG + PTKP_TAMBAHAN_TANGGUNGAN * tanggungan
        label = "Tidak Kawin"

    uraian = (
        f"PTKP {label} ({status}) + {tanggungan} tanggungan: "
        f"Rp{nilai:,.0f}"
    )
    return HasilPTKP(status=status, jumlah_tanggungan=tanggungan, nilai_ptkp=nilai, uraian=uraian)


def hitung_pph_pasal_17(pkp: float) -> HasilPPhPasal17:
    """Menghitung PPh terutang dengan tarif progresif Pasal 17 (UU HPP)."""
    if pkp <= 0:
        return HasilPPhPasal17(pkp=0, pph_terutang=0, rincian=[])

    sisa = pkp
    total_pph = 0.0
    rincian = []
    batas_atas_sebelumnya = 0

    for batas_atas, tarif in TARIF_PASAL_17:
        if sisa <= 0:
            break
        bagian = min(sisa, batas_atas - batas_atas_sebelumnya)
        pph_bagian = bagian * tarif
        rincian.append(
            {
                "lapisan": f"{batas_atas_sebelumnya:,.0f} - {batas_atas if batas_atas != float('inf') else '>5.000.000.000':,.0f}",
                "dasar": bagian,
                "tarif": tarif,
                "pph": round(pph_bagian, 2),
            }
        )
        total_pph += pph_bagian
        sisa -= bagian
        batas_atas_sebelumnya = batas_atas

    return HasilPPhPasal17(pkp=pkp, pph_terutang=round(total_pph, 2), rincian=rincian)


def _penghasilan_neto_usaha(penghasilan: dict) -> float:
    """Menghitung penghasilan neto dari usaha/pekerjaan bebas (Lampiran I)."""
    metode = penghasilan.get("metode", "pembukuan")
    usaha = penghasilan.get("usaha") or {}

    if metode == "pencatatan":
        pencatatan = penghasilan.get("usaha_pencatatan") or {}
        peredaran = float(pencatatan.get("peredaran_usaha") or 0)
        norma = float(pencatatan.get("norma_persen") or 0)
        return round(peredaran * (norma / 100), 2)

    # Metode pembukuan
    laba_rugi_bruto = float(usaha.get("laba_rugi_bruto") or 0)
    biaya_usaha = float(usaha.get("biaya_usaha") or 0)
    if laba_rugi_bruto <= 0:
        peredaran = float(usaha.get("peredaran_usaha") or 0)
        hpp = float(usaha.get("hpp") or 0)
        laba_rugi_bruto = peredaran - hpp
    penghasilan_neto_komersial = float(usaha.get("penghasilan_neto_komersial") or 0)
    if penghasilan_neto_komersial <= 0:
        penghasilan_neto_komersial = laba_rugi_bruto - biaya_usaha

    jumlah_penyesuaian_positif = float(usaha.get("jumlah_penyesuaian_positif") or 0)
    jumlah_penyesuaian_negatif = float(usaha.get("jumlah_penyesuaian_negatif") or 0)

    return round(
        penghasilan_neto_komersial + jumlah_penyesuaian_positif - jumlah_penyesuaian_negatif,
        2,
    )


def _penghasilan_neto_pekerjaan(penghasilan: dict) -> float:
    """Total penghasilan neto dari pekerjaan (bagian C Lampiran I)."""
    pekerjaan = penghasilan.get("pekerjaan") or []
    return round(sum(float(p.get("penghasilan_neto") or 0) for p in pekerjaan), 2)


def _penghasilan_neto_dalam_negeri_lainnya(penghasilan: dict) -> float:
    """Total penghasilan neto dalam negeri lainnya (bagian D Lampiran I)."""
    lainnya = penghasilan.get("dalam_negeri_lainnya") or []
    return round(sum(float(d.get("penghasilan_neto") or 0) for d in lainnya), 2)


def _penghasilan_neto_luar_negeri(penghasilan: dict) -> float:
    """Penghasilan neto luar negeri (bisa negatif bila sudah dikurangi pajak luar negeri)."""
    return round(float(penghasilan.get("luar_negeri") or 0), 2)


def _total_kredit_pajak(kredit: dict) -> tuple[float, float, float]:
    """
    Menghitung:
    - kredit pajak dalam negeri (PPh 24)
    - total PPh dipotong pihak lain (21/22/23/26/DTP)
    - jumlah kredit pajak
    """
    dalam_negeri = round(float(kredit.get("dalam_negeri") or 0), 2)

    pemotongan = kredit.get("pemotongan") or []
    total_pemotongan = round(
        sum(float(p.get("jumlah") or 0) for p in pemotongan), 2
    )

    return dalam_negeri, total_pemotongan, round(dalam_negeri + total_pemotongan, 2)


def _penghasilan_neto_final(penghasilan: dict) -> float:
    """Total penghasilan yang dikenai PPh final (untuk informasi, bukan objek di induk)."""
    final = penghasilan.get("final") or []
    return round(sum(float(f.get("penghasilan_bruto") or 0) for f in final), 2)


def hitung_spt(data: dict, form_type: str = "1770") -> HasilSPT:
    """
    Menghitung SPT Tahunan PPh Orang Pribadi berdasarkan data formulir.

    `data` mengikuti struktur berikut (lihat spt_schema.py):
    {
      "identitas": {...},
      "penghasilan": {...},
      "kredit_pajak": {...},
      "harta": [...],
      "utang": [...],
      "tanggungan": [...],
      "permohonan": {...},
    }
    """
    identitas = data.get("identitas") or {}
    penghasilan = data.get("penghasilan") or {}
    kredit = data.get("kredit_pajak") or {}
    tanggungan = data.get("tanggungan") or []

    tahun_pajak = int(identitas.get("tahun_pajak") or 0)
    status = identitas.get("status_kawin") or STATUS_KK

    # Alur Formulir Induk
    angka_1 = _penghasilan_neto_usaha(penghasilan) if form_type == "1770" else 0.0
    angka_2 = _penghasilan_neto_pekerjaan(penghasilan)
    angka_3 = _penghasilan_neto_dalam_negeri_lainnya(penghasilan)
    angka_4 = _penghasilan_neto_luar_negeri(penghasilan)
    angka_5 = round(angka_1 + angka_2 + angka_3 + angka_4, 2)

    zakat = round(float(penghasilan.get("zakat") or 0), 2)
    angka_6 = zakat
    angka_7 = round(angka_5 - zakat, 2)

    # Kompensasi kerugian hanya berlaku pada Formulir 1770 (angka 8);
    # Formulir 1770S (karyawan) tidak memiliki baris kompensasi.
    kompensasi = round(float(penghasilan.get("kompensasi_kerugian") or 0), 2)
    if form_type == "1770S":
        angka_8 = 0.0
        angka_9 = angka_7
    else:
        angka_8 = kompensasi
        angka_9 = round(angka_7 - kompensasi, 2)

    ptkp = hitung_ptkp(status, len(tanggungan))
    angka_10 = ptkp.nilai_ptkp
    angka_11 = max(0.0, round(angka_9 - angka_10, 2))

    pph_pasal_17 = hitung_pph_pasal_17(angka_11)
    angka_12 = pph_pasal_17.pph_terutang

    kredit_dalam_negeri, kredit_pemotongan, jumlah_kredit = _total_kredit_pajak(kredit)
    angka_13 = kredit_dalam_negeri
    angka_14 = kredit_pemotongan
    angka_15 = jumlah_kredit

    # 1770 angka 13 / 1770S angka 10: pengembalian/pengurangan PPh 24 yang telah dikreditkan
    pengembalian_pph_24 = round(float(penghasilan.get("pengembalian_pph_24") or 0), 2)
    # 1770 angka 14 / 1770S angka 11: JUMLAH PPh TERUTANG (12 + 13)
    jumlah_pph_terutang = round(angka_12 + pengembalian_pph_24, 2)

    # 1770 angka 16a / 1770S angka 13a: PPh yang harus dibayar sendiri (14 - 15)
    angka_16 = round(max(0.0, jumlah_pph_terutang - angka_15), 2)
    # 1770 angka 16b / 1770S angka 13b: PPh yang lebih dipotong/dipungut
    pph_lebih_dipotong = round(max(0.0, angka_15 - jumlah_pph_terutang), 2)

    pph_dibayar_sendiri = round(float(kredit.get("pph_dibayar_sendiri_25") or 0), 2)
    angka_17 = pph_dibayar_sendiri

    # 1770 angka 17b / 1770S angka 14b: STP PPh Pasal 25 (hanya pokok pajak)
    stp_pph_25 = round(float(kredit.get("stp_pph_25") or 0), 2)
    # 1770 angka 18 / 1770S angka 15: JUMLAH KREDIT PAJAK (17a + 17b)
    jumlah_kredit_pph_25 = round(angka_17 + stp_pph_25, 2)

    # 1770 angka 19 / 1770S angka 16: PPh kurang/lebih bayar (16 - 18)
    angka_18 = round(angka_16 - jumlah_kredit_pph_25, 2)

    if angka_18 > 0:
        angka_19a = angka_18  # PPh kurang bayar (Pasal 29)
        angka_19b = 0.0
    else:
        # Lebih bayar = (18 - 16a) + 16b, sesuai alur resmi 1770/1770S
        angka_19a = 0.0
        angka_19b = abs(angka_18) + pph_lebih_dipotong  # PPh lebih bayar (28A)

    # Angsuran PPh Pasal 25 tahun berikutnya:
    # 1/12 x JUMLAH PADA ANGKA 16 (1770) / 1/12 x JUMLAH PADA ANGKA 13 (1770S),
    # yaitu PPh yang harus dibayar sendiri.
    angka_21 = round(angka_16 / 12, 2)

    catatan = []
    if angka_9 <= angka_10:
        catatan.append("Penghasilan neto tidak melebihi PTKP — tidak ada PPh terutang.")
    if angka_19b > 0:
        catatan.append("Terjadi lebih bayar — dapat mengajukan restitusi (angka 20).")
    if angka_19a > 0:
        catatan.append(
            "Terjadi kurang bayar — wajib membayar PPh Pasal 29 sebelum batas "
            "pelaporan SPT (31 Maret)."
        )

    return HasilSPT(
        form_type=form_type,
        tahun_pajak=tahun_pajak,
        angka_1=angka_1,
        angka_2=angka_2,
        angka_3=angka_3,
        angka_4=angka_4,
        angka_5=angka_5,
        angka_6=angka_6,
        angka_7=angka_7,
        angka_8=angka_8,
        angka_9=angka_9,
        angka_10=angka_10,
        angka_11=angka_11,
        angka_12=angka_12,
        angka_13=angka_13,
        angka_14=angka_14,
        angka_15=angka_15,
        angka_16=angka_16,
        angka_17=angka_17,
        angka_18=angka_18,
        angka_19a=angka_19a,
        angka_19b=angka_19b,
        angka_21=angka_21,
        pengembalian_pph_24=pengembalian_pph_24,
        jumlah_pph_terutang=jumlah_pph_terutang,
        pph_lebih_dipotong=pph_lebih_dipotong,
        stp_pph_25=stp_pph_25,
        jumlah_kredit_pph_25=jumlah_kredit_pph_25,
        ptkp_detail=ptkp,
        pph_pasal_17_detail=pph_pasal_17,
        catatan=catatan,
    )
