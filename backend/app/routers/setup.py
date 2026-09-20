"""Router setup onboarding: company profile, COA selection, dan completion."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.database import get_db
from app.database.models import Akun, KategoriAkun, SaldoNormal, User
from app.middleware.auth import require_active_user
from app.database.migration import COA_TEMPLATES

router = APIRouter(prefix="/setup", tags=["Setup"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SetupStatusResponse(BaseModel):
    setup_completed: bool


class CompanySetupRequest(BaseModel):
    company_name: str
    business_type: str | None = None  # UMKM, CV, PT, etc.
    business_field: str | None = None  # perdagangan, jasa, manufaktur
    address: str | None = None


class ApplyTemplateRequest(BaseModel):
    template_id: str  # "perdagangan", "jasa", "manufaktur"


class CustomAccountInput(BaseModel):
    kode_akun: str
    nama_akun: str
    kategori: str
    sub_kategori: str | None = None
    saldo_normal: str


class CustomCOARequest(BaseModel):
    accounts: list[CustomAccountInput]


class CoaTemplatePreview(BaseModel):
    id: str
    name: str
    description: str
    account_count: int
    accounts: list[dict]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.get("/status", response_model=SetupStatusResponse)
def get_setup_status(
    current_user: User = Depends(require_active_user),
) -> SetupStatusResponse:
    return SetupStatusResponse(setup_completed=current_user.setup_completed)


@router.get("/coa-templates", response_model=list[CoaTemplatePreview])
def list_coa_templates(
    _: User = Depends(require_active_user),
) -> list[CoaTemplatePreview]:
    templates = []
    for tid, tmpl in COA_TEMPLATES.items():
        templates.append(CoaTemplatePreview(
            id=tmpl["id"],
            name=tmpl["name"],
            description=tmpl["description"],
            account_count=len(tmpl["accounts"]),
            accounts=[
                {
                    "kode_akun": a[0],
                    "nama_akun": a[1],
                    "kategori": a[2].value,
                    "sub_kategori": a[3],
                    "saldo_normal": a[4].value,
                }
                for a in tmpl["accounts"]
            ],
        ))
    return templates


@router.post("/company")
def save_company_info(
    payload: CompanySetupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> dict:
    current_user.company_name = payload.company_name
    db.commit()
    logger.info("Setup: company info saved for user %s", current_user.id)
    return {"status": "ok", "message": "Data usaha berhasil disimpan"}


@router.post("/coa/apply-template")
def apply_coa_template(
    payload: ApplyTemplateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> dict:
    template = COA_TEMPLATES.get(payload.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{payload.template_id}' tidak ditemukan. Pilih: {', '.join(COA_TEMPLATES.keys())}",
        )

    existing_codes = {a.kode_akun for a in db.query(Akun.kode_akun).all()}
    new_accounts = []
    for kode, nama, kategori, sub, saldo_normal in template["accounts"]:
        if kode not in existing_codes:
            new_accounts.append(Akun(
                kode_akun=kode,
                nama_akun=nama,
                kategori=kategori,
                sub_kategori=sub,
                saldo_normal=saldo_normal,
            ))
    if new_accounts:
        db.add_all(new_accounts)
        db.commit()
        logger.info("Setup: applied template '%s' — %d akun ditambahkan", payload.template_id, len(new_accounts))
    else:
        logger.info("Setup: template '%s' applied, semua akun sudah ada", payload.template_id)

    return {
        "status": "ok",
        "message": f"Template '{template['name']}' berhasil diterapkan",
        "accounts_added": len(new_accounts),
    }


@router.post("/coa/custom")
def apply_custom_coa(
    payload: CustomCOARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> dict:
    if len(payload.accounts) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="COA minimal harus punya 2 akun",
        )

    kategori_map = {k.value: k for k in KategoriAkun}
    saldo_map = {s.value: s for s in SaldoNormal}

    existing_codes = {a.kode_akun for a in db.query(Akun.kode_akun).all()}
    new_accounts = []
    for acc in payload.accounts:
        if acc.kode_akun in existing_codes:
            continue
        kategori = kategori_map.get(acc.kategori.upper())
        saldo = saldo_map.get(acc.saldo_normal.upper())
        if not kategori or not saldo:
            continue
        new_accounts.append(Akun(
            kode_akun=acc.kode_akun,
            nama_akun=acc.nama_akun,
            kategori=kategori,
            sub_kategori=acc.sub_kategori,
            saldo_normal=saldo,
        ))
    if new_accounts:
        db.add_all(new_accounts)
        db.commit()
        logger.info("Setup: custom COA — %d akun ditambahkan", len(new_accounts))

    return {
        "status": "ok",
        "message": f"{len(new_accounts)} akun custom berhasil disimpan",
        "accounts_added": len(new_accounts),
    }


@router.post("/complete")
def complete_setup(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> dict:
    current_user.setup_completed = True
    db.commit()
    logger.info("Setup: user %s completed onboarding", current_user.id)
    return {"status": "ok", "message": "Setup selesai, selamat datang di Finora!"}
