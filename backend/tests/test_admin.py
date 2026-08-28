"""Tests untuk dashboard admin monitoring user & paket maintenance.

Mencakup: ringkasan statistik, daftar/cari/filter user, buat user oleh admin,
ubah role/plan/status aktif, perlindungan admin (non-admin ditolak), dan
registrasi user memilih paket maintenance.
"""

from datetime import datetime, timezone

from app.database.models import PlanUser, RoleUser, User
from app.middleware.auth import hash_password


def _add_user(db, *, email, role=RoleUser.OWNER, plan=PlanUser.FREE, full_name="Orang Biasa"):
    user = User(
        email=email,
        hashed_password=hash_password("Test1234!"),
        full_name=full_name,
        role=role,
        plan=plan,
        is_active=True,
        email_verified=True,
        maintenance_joined_at=None if plan == PlanUser.FREE else datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestAdminAccess:
    def test_admin_routes_require_admin(self, auth_client):
        """Non-admin (OWNER) tidak boleh akses endpoint admin."""
        resp = auth_client.get("/admin/summary")
        assert resp.status_code == 403

    def test_admin_routes_require_auth(self, client):
        resp = client.get("/admin/summary")
        assert resp.status_code == 401


class TestAdminSummary:
    def test_summary_counts(self, admin_client, db):
        db.add(User(
            email="mtn@example.com",
            hashed_password=hash_password("Test1234!"),
            full_name="User Maintenance",
            role=RoleUser.OWNER,
            plan=PlanUser.MAINTENANCE,
            is_active=True,
            email_verified=True,
            maintenance_joined_at=datetime.now(timezone.utc),
        ))
        db.commit()

        resp = admin_client.get("/admin/summary")
        assert resp.status_code == 200
        data = resp.json()
        # admin_client menciptakan 1 admin + 1 user maintenance
        assert data["total_users"] == 2
        assert data["maintenance_users"] == 1
        assert data["free_users"] == 1
        assert "monthly_growth" in data
        assert len(data["monthly_growth"]) == 6

    def test_monthly_growth_shape(self, admin_client):
        resp = admin_client.get("/admin/summary")
        data = resp.json()
        for row in data["monthly_growth"]:
            assert row["month"].count("-") == 1
            assert row["total"] == row["free"] + row["maintenance"]
            assert row["total"] >= 0


class TestAdminListUsers:
    def test_list_users_filter_plan(self, admin_client, db):
        _add_user(db, email="free.a@example.com", plan=PlanUser.FREE)
        _add_user(db, email="mtn.a@example.com", plan=PlanUser.MAINTENANCE)

        only_mtn = admin_client.get("/admin/users", params={"plan": "MAINTENANCE"})
        assert only_mtn.status_code == 200
        emails = [u["email"] for u in only_mtn.json()]
        assert "mtn.a@example.com" in emails
        assert "free.a@example.com" not in emails

        invalid = admin_client.get("/admin/users", params={"plan": "HANYA_MANTAP"})
        assert invalid.status_code == 400

    def test_list_users_search(self, admin_client, db):
        _add_user(db, email="tokosehat@example.com", full_name="Toko Sehat")
        _add_user(db, email="tokobiru@example.com", full_name="Toko Biru")

        resp = admin_client.get("/admin/users", params={"s": "sehat"})
        emails = [u["email"] for u in resp.json()]
        assert emails == ["tokosehat@example.com"]

    def test_list_users_sorted_newest_first(self, admin_client, db):
        _add_user(db, email="lama@example.com")
        _add_user(db, email="baru@example.com")
        emails = [u["email"] for u in admin_client.get("/admin/users").json()]
        assert emails.index("baru@example.com") < emails.index("lama@example.com")


class TestAdminCreateUser:
    def test_create_user(self, admin_client):
        resp = admin_client.post("/admin/users", json={
            "email": "made-admin@example.com",
            "password": "Password123!",
            "full_name": "Made Admin",
            "role": "ADMIN",
            "plan": "MAINTENANCE",
        })
        assert resp.status_code == 201

    def test_create_duplicate_email(self, admin_client, db):
        _add_user(db, email="dupe@example.com")
        resp = admin_client.post("/admin/users", json={
            "email": "dupe@example.com",
            "password": "Password123!",
            "full_name": "Dupe",
        })
        assert resp.status_code == 409

    def test_create_weak_password_rejected(self, admin_client):
        resp = admin_client.post("/admin/users", json={
            "email": "weak@example.com",
            "password": "aaaaaaaa",
            "full_name": "Weak",
        })
        assert resp.status_code == 400


class TestAdminUpdateUser:
    def test_switch_plan_sets_joined_at(self, admin_client, db):
        user = _add_user(db, email="switch@example.com", plan=PlanUser.FREE)
        assert user.maintenance_joined_at is None

        resp = admin_client.patch(f"/admin/users/{user.id}", json={"plan": "MAINTENANCE"})
        assert resp.status_code == 200
        db.refresh(user)
        assert user.plan == PlanUser.MAINTENANCE
        assert user.maintenance_joined_at is not None

    def test_back_to_free_clears_joined_at(self, admin_client, db):
        user = _add_user(db, email="backfree@example.com", plan=PlanUser.MAINTENANCE)
        resp = admin_client.patch(f"/admin/users/{user.id}", json={"plan": "FREE"})
        assert resp.status_code == 200
        db.refresh(user)
        assert user.maintenance_joined_at is None

    def test_deactivate_user(self, admin_client, db):
        user = _add_user(db, email="deact@example.com")
        resp = admin_client.patch(f"/admin/users/{user.id}", json={"is_active": False})
        assert resp.status_code == 200
        db.refresh(user)
        assert user.is_active is False

    def test_cannot_demote_self(self, admin_client):
        admin = admin_client.get("/auth/me").json()
        resp = admin_client.patch(f"/admin/users/{admin['id']}", json={"role": "OWNER"})
        assert resp.status_code == 400

    def test_update_missing_user_404(self, admin_client):
        resp = admin_client.patch("/admin/users/tidak-ada", json={"plan": "MAINTENANCE"})
        assert resp.status_code == 404


class TestRegisterPlan:
    def test_register_with_maintenance_plan(self, client, db):
        resp = client.post(
            "/auth/register",
            json={
                "email": "planner@example.com",
                "password": "Password123!",
                "full_name": "Paket Maintenance",
                "plan": "MAINTENANCE",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["plan"] == "MAINTENANCE"
        assert data["maintenance_joined_at"] is not None

    def test_register_default_free(self, client, db):
        resp = client.post(
            "/auth/register",
            json={
                "email": "default@example.com",
                "password": "Password123!",
                "full_name": "Default",
            },
        )
        assert resp.status_code == 201
        assert resp.json()["plan"] == "FREE"


class TestAdminHealth:
    def test_health_is_admin_only(self, auth_client):
        resp = auth_client.get("/admin/health")
        assert resp.status_code == 403

    def test_health_returns_services(self, admin_client):
        resp = admin_client.get("/admin/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "database" in data
        assert "qdrant" in data
        assert "seed_status" in data


class TestBootstrapAdminSeed:
    def test_promotes_existing_user(self, db):
        from app.database.migration import seed_bootstrap_admin

        _add_user(db, email="haidarmgn@gmail.com", role=RoleUser.OWNER)
        seed_bootstrap_admin(db=db)
        user = db.query(User).filter(User.email == "haidarmgn@gmail.com").first()
        assert user.role == RoleUser.ADMIN
        assert user.is_active is True

    def test_creates_missing_user(self, db):
        from app.database.migration import seed_bootstrap_admin

        seed_bootstrap_admin(db=db)
        user = db.query(User).filter(User.email == "haidarmgn@gmail.com").first()
        assert user is not None
        assert user.role == RoleUser.ADMIN
        assert user.email_verified is True