"""Tests untuk upload: validasi ukuran, ekstensi, role admin."""

import pytest


class TestUploadValidation:
    def test_upload_requires_auth(self, client):
        resp = client.post("/upload/file", files={"file": ("test.csv", b"data", "text/csv")})
        assert resp.status_code == 401

    def test_upload_invalid_extension(self, auth_client):
        resp = auth_client.post(
            "/upload/file",
            files={"file": ("malware.exe", b"MZ\x90\x00", "application/octet-stream")},
        )
        assert resp.status_code in (400, 415, 422)

    def test_upload_empty_file(self, auth_client):
        resp = auth_client.post(
            "/upload/file",
            files={"file": ("empty.csv", b"", "text/csv")},
        )
        assert resp.status_code in (400, 422)


class TestUploadAdminReset:
    def test_reset_requires_active_user(self, client):
        """Unauthenticated reset should return 401."""
        resp = client.delete("/upload/reset")
        assert resp.status_code == 401

    def test_reset_owner_can_reset_own_data(self, auth_client):
        """Owner can reset their own data (no data to delete = 204)."""
        resp = auth_client.delete("/upload/reset")
        assert resp.status_code == 204
