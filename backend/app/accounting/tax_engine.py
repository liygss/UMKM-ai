"""
Tax engine untuk kebutuhan UMKM: PPh Final UMKM dan PPN.

PENTING: modul ini adalah alat bantu hitung berdasarkan aturan umum yang
berlaku (per pengecekan terakhir, Juli 2026). Aturan pajak bisa berubah
sewaktu-waktu lewat PMK/Peraturan Dirjen baru. Selalu validasi ke
konsultan pajak atau situs resmi DJP (pajak.go.id) sebelum dipakai untuk
pelaporan resmi — jangan jadikan hasil fungsi ini sebagai satu-satunya
dasar pelaporan SPT.

Referensi utama:
- UU No. 7/2021 (UU HPP)
- PP No. 55/2022 tentang PPh atas penghasilan usaha yang diterima WP
  dengan peredaran bruto tertentu (PPh Final UMKM)
- PMK No. 131/2024 tentang tarif PPN 12% khusus barang mewah (PPnBM)
"""

from dataclasses import dataclass

# ---------------------------------------------------------------------------
# PPh Final UMKM (PP 55/2022)
# ---------------------------------------------------------------------------
TARIF_PPH_FINAL_UMKM = 0.005  # 0.5%
BATAS_OMZET_TIDAK_KENA_PAJAK_TAHUNAN = 500_000_000  # Rp500 juta/tahun (khusus WP Orang Pribadi)
BATAS_OMZET_PP_55_TAHUNAN = 4_800_000_000  # Rp4,8 miliar/tahun, batas atas skema PPh Final UMKM


@dataclass
class HasilPPhFinalUMKM:
    omzet_bulan_ini: float
    omzet_kumulatif_tahun_berjalan: float  # termasuk omzet_bulan_ini
    omzet_kena_pajak: float
    pph_final_terutang: float
    catatan: str


def hitung_pph_final_umkm(
    omzet_bulan_ini: float,
    omzet_kumulatif_sebelum_bulan_ini: float,
    wp_orang_pribadi: bool = True,
) -> HasilPPhFinalUMKM:
    """
    Menghitung PPh Final UMKM (tarif 0,5%) untuk satu masa pajak (bulan).

    Aturan (PP 55/2022 & UU HPP):
    - WP Orang Pribadi: omzet sampai dengan Rp500 juta/tahun (kumulatif)
      TIDAK dikenakan PPh (dibebaskan). Hanya bagian omzet di atas Rp500 juta
      yang dikenakan tarif 0,5%.
    - WP Badan (PT/CV dsb): tidak mendapat fasilitas bebas Rp500 juta ini,
      seluruh omzet yang masuk skema PP 55/2022 dikenakan 0,5% sejak awal.
    - Skema PPh Final UMKM ini hanya berlaku untuk omzet s/d Rp4,8 miliar/tahun;
      di atas itu wajib pakai skema PPh normal (Pasal 17 UU PPh / PPh Badan).
    """
    omzet_kumulatif = omzet_kumulatif_sebelum_bulan_ini + omzet_bulan_ini

    if omzet_kumulatif > BATAS_OMZET_PP_55_TAHUNAN:
        return HasilPPhFinalUMKM(
            omzet_bulan_ini=omzet_bulan_ini,
            omzet_kumulatif_tahun_berjalan=omzet_kumulatif,
            omzet_kena_pajak=0.0,
            pph_final_terutang=0.0,
            catatan=(
                "Omzet kumulatif tahun berjalan sudah melebihi Rp4.800.000.000. "
                "Skema PPh Final UMKM (0,5%) tidak berlaku lagi — gunakan skema "
                "PPh normal (Pasal 17 UU PPh untuk WP OP, atau PPh Badan 22% "
                "untuk WP Badan) dan konsultasikan ke konsultan pajak."
            ),
        )

    if wp_orang_pribadi and omzet_kumulatif <= BATAS_OMZET_TIDAK_KENA_PAJAK_TAHUNAN:
        return HasilPPhFinalUMKM(
            omzet_bulan_ini=omzet_bulan_ini,
            omzet_kumulatif_tahun_berjalan=omzet_kumulatif,
            omzet_kena_pajak=0.0,
            pph_final_terutang=0.0,
            catatan="Omzet kumulatif tahun ini masih di bawah Rp500.000.000 — dibebaskan dari PPh (WP Orang Pribadi).",
        )

    if wp_orang_pribadi and omzet_kumulatif_sebelum_bulan_ini < BATAS_OMZET_TIDAK_KENA_PAJAK_TAHUNAN:
        # Sebagian omzet bulan ini masih kena fasilitas bebas Rp500 juta,
        # sisanya baru mulai kena tarif 0,5%.
        omzet_kena_pajak = round(omzet_kumulatif - BATAS_OMZET_TIDAK_KENA_PAJAK_TAHUNAN, 2)
        pph_terutang = round(omzet_kena_pajak * TARIF_PPH_FINAL_UMKM, 2)
        return HasilPPhFinalUMKM(
            omzet_bulan_ini=omzet_bulan_ini,
            omzet_kumulatif_tahun_berjalan=omzet_kumulatif,
            omzet_kena_pajak=omzet_kena_pajak,
            pph_final_terutang=pph_terutang,
            catatan=(
                "Omzet bulan ini membuat kumulatif tahun berjalan melewati "
                "Rp500.000.000 — hanya bagian yang melebihi ambang batas yang "
                "dikenakan PPh Final 0,5%."
            ),
        )

    # WP Badan, atau WP OP yang kumulatif tahunannya sudah di atas Rp500 juta
    pph_terutang = round(omzet_bulan_ini * TARIF_PPH_FINAL_UMKM, 2)
    return HasilPPhFinalUMKM(
        omzet_bulan_ini=omzet_bulan_ini,
        omzet_kumulatif_tahun_berjalan=omzet_kumulatif,
        omzet_kena_pajak=omzet_bulan_ini,
        pph_final_terutang=pph_terutang,
        catatan="Dikenakan PPh Final UMKM 0,5% dari omzet bulan ini.",
    )


# ---------------------------------------------------------------------------
# PPN (Pajak Pertambahan Nilai)
# ---------------------------------------------------------------------------
# Per pengecekan terakhir (2026): tarif PPN umum tetap 11% untuk barang/jasa
# non-mewah (memakai mekanisme DPP nilai lain 11/12 x tarif 12% sesuai PMK
# 131/2024). Tarif 12% penuh hanya berlaku untuk barang tergolong mewah
# (obyek PPnBM, mis. kendaraan mewah, kapal pesiar, rumah sangat mewah).
TARIF_PPN_UMUM = 0.11
TARIF_PPN_BARANG_MEWAH = 0.12


@dataclass
class HasilPPN:
    dasar_pengenaan_pajak: float
    tarif_digunakan: float
    ppn: float
    harga_termasuk_ppn: float


def hitung_ppn(dasar_pengenaan_pajak: float, barang_mewah: bool = False) -> HasilPPN:
    """
    Menghitung PPN dari Dasar Pengenaan Pajak (DPP / harga jual sebelum pajak).
    Set `barang_mewah=True` hanya untuk barang yang termasuk obyek PPnBM
    sesuai PMK 131/2024 (kendaraan mewah, kapal pesiar, hunian sangat mewah, dll).
    """
    tarif = TARIF_PPN_BARANG_MEWAH if barang_mewah else TARIF_PPN_UMUM
    ppn = round(dasar_pengenaan_pajak * tarif, 2)
    return HasilPPN(
        dasar_pengenaan_pajak=dasar_pengenaan_pajak,
        tarif_digunakan=tarif,
        ppn=ppn,
        harga_termasuk_ppn=round(dasar_pengenaan_pajak + ppn, 2),
    )


def hitung_ppn_dari_harga_termasuk_pajak(harga_termasuk_ppn: float, barang_mewah: bool = False) -> HasilPPN:
    """Kebalikan dari hitung_ppn(): dipakai kalau harga yang diketahui sudah termasuk PPN."""
    tarif = TARIF_PPN_BARANG_MEWAH if barang_mewah else TARIF_PPN_UMUM
    dpp = round(harga_termasuk_ppn / (1 + tarif), 2)
    ppn = round(harga_termasuk_ppn - dpp, 2)
    return HasilPPN(
        dasar_pengenaan_pajak=dpp,
        tarif_digunakan=tarif,
        ppn=ppn,
        harga_termasuk_ppn=harga_termasuk_ppn,
    )
