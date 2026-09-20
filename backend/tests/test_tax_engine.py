"""Unit tests untuk tax_engine: PPh Final UMKM & PPN."""

import pytest

from app.accounting.tax_engine import (
    TARIF_PPH_FINAL_UMKM,
    TARIF_PPN_UMUM,
    TARIF_PPN_BARANG_MEWAH,
    BATAS_OMZET_TIDAK_KENA_PAJAK_TAHUNAN,
    BATAS_OMZET_PP_55_TAHUNAN,
    hitung_pph_final_umkm,
    hitung_ppn,
    hitung_ppn_dari_harga_termasuk_pajak,
)


# ===========================================================================
# PPh Final UMKM
# ===========================================================================

class TestPPhFinalUMKM:

    def test_wp_op_omzet_bawah_bebas_pajak(self):
        h = hitung_pph_final_umkm(omzet_bulan_ini=40_000_000, omzet_kumulatif_sebelum_bulan_ini=0)
        assert h.pph_final_terutang == 0
        assert h.omzet_kena_pajak == 0
        assert "dibebaskan" in h.catatan.lower() or "Rp500" in h.catatan

    def test_wp_op_tepat_sampai_500jt_bebas(self):
        h = hitung_pph_final_umkm(omzet_bulan_ini=50_000_000, omzet_kumulatif_sebelum_bulan_ini=450_000_000)
        assert h.pph_final_terutang == 0
        assert h.omzet_kena_pajak == 0

    def test_wp_op_melewati_500jt_hanya_kelebihan(self):
        h = hitung_pph_final_umkm(omzet_bulan_ini=100_000_000, omzet_kumulatif_sebelum_bulan_ini=480_000_000)
        # kumulatif = 580jt, kena pajak = 580jt - 500jt = 80jt
        assert h.omzet_kumulatif_tahun_berjalan == 580_000_000
        assert h.omzet_kena_pajak == 80_000_000
        expected_ppn = round(80_000_000 * 0.005, 2)
        assert h.pph_final_terutang == expected_ppn

    def test_wp_op_sudah_di_atas_500jt_kena_seluruh_omzet_bulan(self):
        h = hitung_pph_final_umkm(omzet_bulan_ini=200_000_000, omzet_kumulatif_sebelum_bulan_ini=600_000_000)
        # kumulatif = 800jt > 500jt, kumulatif_sebelum > 500jt → seluruh omzet kena
        assert h.omzet_kena_pajak == 200_000_000
        assert h.pph_final_terutang == round(200_000_000 * 0.005, 2)

    def test_wp_badan_tidak_dapat_fasilitas_500jt(self):
        h = hitung_pph_final_umkm(
            omzet_bulan_ini=100_000_000,
            omzet_kumulatif_sebelum_bulan_ini=0,
            wp_orang_pribadi=False,
        )
        # Badan: seluruh omzet kena 0,5% sejak awal
        assert h.omzet_kena_pajak == 100_000_000
        assert h.pph_final_terutang == round(100_000_000 * 0.005, 2)

    def test_melebihi_4_8_miliar_tidak_berlaku(self):
        h = hitung_pph_final_umkm(
            omzet_bulan_ini=500_000_000,
            omzet_kumulatif_sebelum_bulan_ini=4_500_000_000,
            wp_orang_pribadi=False,
        )
        # kumulatif = 5.0M > 4.8M
        assert h.pph_final_terutang == 0
        assert "4.800.000.000" in h.catatan or "4.8 miliar" in h.catatan.lower()

    def test_omzet_negatif_raises(self):
        with pytest.raises(ValueError, match="negatif"):
            hitung_pph_final_umkm(omzet_bulan_ini=-100, omzet_kumulatif_sebelum_bulan_ini=0)

    def test_kumulatif_negatif_raises(self):
        with pytest.raises(ValueError, match="negatif"):
            hitung_pph_final_umkm(omzet_bulan_ini=100, omzet_kumulatif_sebelum_bulan_ini=-500)


# ===========================================================================
# PPN
# ===========================================================================

class TestPPN:

    def test_ppn_dari_dpp_11_persen(self):
        h = hitung_ppn(dasar_pengenaan_pajak=1_000_000)
        assert h.dasar_pengenaan_pajak == 1_000_000
        assert h.tarif_digunakan == TARIF_PPN_UMUM
        expected_ppn = round(1_000_000 * 0.11, 2)
        assert h.ppn == expected_ppn
        assert h.harga_termasuk_ppn == round(1_000_000 + expected_ppn, 2)
        assert h.catatan  # catatan tidak kosong

    def test_ppn_dari_dpp_12_persen_mewah(self):
        h = hitung_ppn(dasar_pengenaan_pajak=1_000_000, barang_mewah=True)
        assert h.tarif_digunakan == TARIF_PPN_BARANG_MEWAH
        expected_ppn = round(1_000_000 * 0.12, 2)
        assert h.ppn == expected_ppn
        assert "12%" in h.catatan or "PPnBM" in h.catatan

    def test_ppn_dari_harga_termasuk_ppn_11_persen(self):
        harga = 1_110_000  # DPP = 1_000_000, PPN = 110_000
        h = hitung_ppn_dari_harga_termasuk_pajak(harga)
        assert h.harga_termasuk_ppn == harga
        assert h.tarif_digunakan == TARIF_PPN_UMUM
        # DPP = 1_110_000 / 1.11 ≈ 1_000_000
        assert h.dasar_pengenaan_pajak == pytest.approx(1_000_000, abs=1)
        assert h.ppn == pytest.approx(110_000, abs=1)

    def test_ppn_dari_harga_termasuk_ppn_12_persen_mewah(self):
        harga = 1_120_000  # DPP = 1_000_000, PPN = 120_000
        h = hitung_ppn_dari_harga_termasuk_pajak(harga, barang_mewah=True)
        assert h.tarif_digunakan == TARIF_PPN_BARANG_MEWAH
        assert h.dasar_pengenaan_pajak == pytest.approx(1_000_000, abs=1)
        assert h.ppn == pytest.approx(120_000, abs=1)
        assert h.catatan

    def test_ppn_konsistensi_dpp_ppn(self):
        """dpp + ppn harus ~= harga_termasuk_ppn (selisih <= 1 karena rounding)."""
        h = hitung_ppn(dasar_pengenaan_pajak=3_456_789)
        assert abs(h.dasar_pengenaan_pajak + h.ppn - h.harga_termasuk_ppn) <= 1

    def test_ppn_dari_harga_konsistensi(self):
        harga = 2_777_500
        h = hitung_ppn_dari_harga_termasuk_pajak(harga)
        assert abs(h.dasar_pengenaan_pajak + h.ppn - h.harga_termasuk_ppn) <= 1

    def test_ppn_dpp_negatif_raises(self):
        with pytest.raises(ValueError, match="negatif"):
            hitung_ppn(dasar_pengenaan_pajak=-100)

    def test_ppn_harga_negatif_raises(self):
        with pytest.raises(ValueError, match="negatif"):
            hitung_ppn_dari_harga_termasuk_pajak(-100)


# ===========================================================================
# Endpoint integration (minimal, memakai auth_client dari conftest)
# ===========================================================================

class TestTaxEndpoints:

    def test_pph_final_umkm_endpoint(self, auth_client):
        resp = auth_client.post("/accounting/pajak/pph-final-umkm", json={
            "omzet_bulan_ini": 100_000_000,
            "omzet_kumulatif_sebelum_bulan_ini": 480_000_000,
            "wp_orang_pribadi": True,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["omzet_kumulatif_tahun_berjalan"] == 580_000_000
        assert body["omzet_kena_pajak"] == 80_000_000
        assert body["pph_final_terutang"] == round(80_000_000 * 0.005, 2)

    def test_pph_final_umkm_badan_endpoint(self, auth_client):
        resp = auth_client.post("/accounting/pajak/pph-final-umkm", json={
            "omzet_bulan_ini": 100_000_000,
            "omzet_kumulatif_sebelum_bulan_ini": 0,
            "wp_orang_pribadi": False,
        })
        assert resp.status_code == 200
        body = resp.json()
        # Badan: seluruh omzet kena
        assert body["omzet_kena_pajak"] == 100_000_000

    def test_ppn_dari_dpp_endpoint(self, auth_client):
        resp = auth_client.post("/accounting/pajak/ppn", json={
            "nilai": 1_000_000,
            "sudah_termasuk_ppn": False,
            "barang_mewah": False,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["tarif_digunakan"] == pytest.approx(0.11)
        assert body["ppn"] == pytest.approx(110_000, abs=1)
        assert "catatan" in body

    def test_ppn_dari_harga_termasuk_endpoint(self, auth_client):
        resp = auth_client.post("/accounting/pajak/ppn", json={
            "nilai": 1_110_000,
            "sudah_termasuk_ppn": True,
            "barang_mewah": False,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["dasar_pengenaan_pajak"] == pytest.approx(1_000_000, abs=1)

    def test_ppn_mewah_endpoint(self, auth_client):
        resp = auth_client.post("/accounting/pajak/ppn", json={
            "nilai": 1_000_000,
            "sudah_termasuk_ppn": False,
            "barang_mewah": True,
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["tarif_digunakan"] == pytest.approx(0.12)

    def test_pph_negatif_omzet_returns_error(self, auth_client):
        resp = auth_client.post("/accounting/pajak/pph-final-umkm", json={
            "omzet_bulan_ini": -100,
            "omzet_kumulatif_sebelum_bulan_ini": 0,
            "wp_orang_pribadi": True,
        })
        assert resp.status_code == 400 or resp.status_code == 422

    def test_ppn_negatif_returns_error(self, auth_client):
        resp = auth_client.post("/accounting/pajak/ppn", json={
            "nilai": -100,
            "sudah_termasuk_ppn": False,
            "barang_mewah": False,
        })
        assert resp.status_code == 400 or resp.status_code == 422
