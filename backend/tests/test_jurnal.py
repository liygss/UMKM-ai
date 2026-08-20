"""Tests untuk jurnal umum: input validation, cookie auth."""

import pytest


class TestJurnalAuth:
    def test_list_jurnal_requires_auth(self, client):
        resp = client.get("/accounting/jurnal")
        assert resp.status_code == 401

    def test_list_jurnal_with_cookie(self, auth_client):
        resp = auth_client.get("/accounting/jurnal")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestJurnalValidation:
    def test_jurnal_validate_totals_mismatch(self, auth_client, db):
        from app.database.models import Akun, SaldoNormal

        db.add(Akun(kode_akun="1101", nama_akun="Kas", kategori="AKTIVA",
                     saldo_normal=SaldoNormal.DEBIT, is_active=True))
        db.add(Akun(kode_akun="8101", nama_akun="Pendapatan", kategori="PENDAPATAN",
                     saldo_normal=SaldoNormal.KREDIT, is_active=True))
        db.commit()

        payload = {
            "tanggal": "2026-01-15",
            "deskripsi": "Test jurnal",
            "jenis_jurnal": "UMUM",
            "details": [
                {"kode_akun": "1101", "debit": 100000, "kredit": 0},
                {"kode_akun": "8101", "debit": 0, "kredit": 50000},
            ],
        }
        resp = auth_client.post("/accounting/jurnal", json=payload)
        assert resp.status_code == 422

    def test_jurnal_validate_debit_kredit_same_line(self, auth_client, db):
        from app.database.models import Akun, SaldoNormal

        db.add(Akun(kode_akun="1101", nama_akun="Kas", kategori="AKTIVA",
                     saldo_normal=SaldoNormal.DEBIT, is_active=True))
        db.commit()

        payload = {
            "tanggal": "2026-01-15",
            "deskripsi": "Test jurnal",
            "jenis_jurnal": "UMUM",
            "details": [
                {"kode_akun": "1101", "debit": 100000, "kredit": 100000},
            ],
        }
        resp = auth_client.post("/accounting/jurnal", json=payload)
        assert resp.status_code == 422

    def test_jurnal_min_two_details(self, auth_client, db):
        from app.database.models import Akun, SaldoNormal

        db.add(Akun(kode_akun="1101", nama_akun="Kas", kategori="AKTIVA",
                     saldo_normal=SaldoNormal.DEBIT, is_active=True))
        db.commit()

        payload = {
            "tanggal": "2026-01-15",
            "deskripsi": "Test jurnal",
            "jenis_jurnal": "UMUM",
            "details": [
                {"kode_akun": "1101", "debit": 100000, "kredit": 0},
            ],
        }
        resp = auth_client.post("/accounting/jurnal", json=payload)
        assert resp.status_code == 422
