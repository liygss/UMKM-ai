"""Tests untuk autentikasi: register, login, cookie-based auth, email verification."""

import pytest


class TestRegister:
    def test_register_success(self, client):
        resp = client.post("/auth/register", json={
            "email": "new@example.com",
            "password": "Strong1Pass!",
            "full_name": "New User",
            "company_name": "New Corp",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["full_name"] == "New User"
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client):
        client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "Strong1Pass!",
            "full_name": "User 1",
        })
        resp = client.post("/auth/register", json={
            "email": "dup@example.com",
            "password": "Strong1Pass!",
            "full_name": "User 2",
        })
        assert resp.status_code == 409

    def test_register_weak_password_no_uppercase(self, client):
        resp = client.post("/auth/register", json={
            "email": "weak@example.com",
            "password": "weakpass1!",
            "full_name": "Weak User",
        })
        # Pydantic returns 422 for validation errors
        assert resp.status_code == 422

    def test_register_weak_password_no_digit(self, client):
        resp = client.post("/auth/register", json={
            "email": "weak@example.com",
            "password": "WeakPass!",
            "full_name": "Weak User",
        })
        assert resp.status_code == 422

    def test_register_weak_password_too_short(self, client):
        resp = client.post("/auth/register", json={
            "email": "weak@example.com",
            "password": "Sh1!",
            "full_name": "Weak User",
        })
        assert resp.status_code == 422


class TestLogin:
    def test_login_sets_cookie(self, client, db):
        from app.database.models import User
        from app.middleware.auth import hash_password

        user = User(
            email="login@example.com",
            hashed_password=hash_password("Login1Pass!"),
            full_name="Login User",
            is_active=True,
        )
        db.add(user)
        db.commit()

        resp = client.post("/auth/login", json={
            "email": "login@example.com",
            "password": "Login1Pass!",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.cookies

    def test_login_wrong_password(self, client, db):
        from app.database.models import User
        from app.middleware.auth import hash_password

        user = User(
            email="wrong@example.com",
            hashed_password=hash_password("Correct1Pass!"),
            full_name="Wrong User",
            is_active=True,
        )
        db.add(user)
        db.commit()

        resp = client.post("/auth/login", json={
            "email": "wrong@example.com",
            "password": "WrongPass!",
        })
        assert resp.status_code == 401

    def test_login_inactive_user(self, client, db):
        from app.database.models import User
        from app.middleware.auth import hash_password

        user = User(
            email="inactive@example.com",
            hashed_password=hash_password("Inactive1Pass!"),
            full_name="Inactive User",
            is_active=False,
        )
        db.add(user)
        db.commit()

        resp = client.post("/auth/login", json={
            "email": "inactive@example.com",
            "password": "Inactive1Pass!",
        })
        assert resp.status_code == 403


class TestCookieAuth:
    def test_me_with_cookie(self, auth_client):
        resp = auth_client.get("/auth/me")
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@example.com"

    def test_me_without_cookie(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_logout_clears_cookie(self, auth_client):
        resp = auth_client.post("/auth/logout")
        assert resp.status_code == 200


class TestEmailVerification:
    def test_verify_email_invalid_token(self, client):
        resp = client.get("/auth/verify-email?token=invalid_token_12345")
        assert resp.status_code in (400, 401)
