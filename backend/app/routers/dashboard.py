"""
Router dashboard: ringkasan keuangan UMKM (saldo kas/bank, pendapatan &
beban bulan berjalan, laba/rugi), dihitung langsung dari accounting engine.
"""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.accounting.dashboard_metrics import get_dashboard_summary, get_pendapatan_beban_bulanan
from app.database.database import get_db
from app.database.models import JurnalUmum, User
from app.middleware.auth import require_active_user
from app.schemas.report_schema import DashboardSummaryResponse, MonthlyTrendResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "module": "dashboard"}


def _latest_data_date(db: Session, user_id: str) -> date:
    """Tanggal transaksi terbaru milik user. Dipakai sebagai default dashboard
    supaya langsung menyesuaikan dengan data yang baru diupload."""
    latest = (
        db.query(func.max(JurnalUmum.tanggal))
        .filter(JurnalUmum.created_by_id == user_id)
        .scalar()
    )
    return latest or date.today()


@router.get("/summary", response_model=DashboardSummaryResponse)
def summary(
    tanggal_per: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> DashboardSummaryResponse:
    # Kalau tidak ada tanggal yang dipilih, otomatis ikut data terbaru user
    # supaya data yang baru diupload langsung terlihat di dashboard.
    if tanggal_per is None:
        tanggal_per = _latest_data_date(db, current_user.id)
    hasil = get_dashboard_summary(db, tanggal_per, user_id=current_user.id)
    return DashboardSummaryResponse(
        tanggal_per=hasil.tanggal_per,
        saldo_kas=hasil.saldo_kas,
        saldo_bank=hasil.saldo_bank,
        total_kas_dan_bank=hasil.total_kas_dan_bank,
        pendapatan_bulan_ini=hasil.pendapatan_bulan_ini,
        beban_bulan_ini=hasil.beban_bulan_ini,
        laba_rugi_bulan_ini=hasil.laba_rugi_bulan_ini,
        total_pendapatan_tahun_berjalan=hasil.total_pendapatan_tahun_berjalan,
        total_beban_tahun_berjalan=hasil.total_beban_tahun_berjalan,
        laba_rugi_tahun_berjalan=hasil.laba_rugi_tahun_berjalan,
        jumlah_transaksi_bulan_ini=hasil.jumlah_transaksi_bulan_ini,
    )


@router.get("/monthly", response_model=list[MonthlyTrendResponse])
def monthly(
    tanggal_per: date | None = None,
    jumlah_bulan: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> list[MonthlyTrendResponse]:
    """Pendapatan vs beban per bulan (default 6 bulan terakhir) untuk chart."""
    if tanggal_per is None:
        tanggal_per = _latest_data_date(db, current_user.id)
    hasil = get_pendapatan_beban_bulanan(
        db, tanggal_per, user_id=current_user.id, jumlah_bulan=jumlah_bulan
    )
    return [
        MonthlyTrendResponse(
            bulan=h.bulan,
            label=h.label,
            pendapatan=h.pendapatan,
            beban=h.beban,
            laba_rugi=h.laba_rugi,
        )
        for h in hasil
    ]
