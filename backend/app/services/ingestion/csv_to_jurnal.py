"""
Konversi data transaksi CSV/XLSX menjadi Jurnal Umum otomatis.

Membaca file keyword_mapping.csv (knowledge/datasets/keyword_mapping.csv)
untuk memetakan deskripsi transaksi ke kode akun debit/kredit, lalu membuat
JurnalUmum + JurnalDetail dengan BATCH INSERT (satu commit untuk semua baris).

Mendukung 2 format CSV:
  Format A (contoh_transaksi.csv):
    tanggal, deskripsi, jumlah, jenis, kategori
  Format B (dataset_transaksi_umkm.csv):
    tanggal, ..., tipe, ..., total, ..., akun_debit, akun_kredit
    -> tipe dipetakan ke jenis (Modal/Penjualan -> masuk, Beban -> keluar)
    -> total dipetakan ke jumlah
    -> akun_debit/akun_kredit (nama) dipetakan ke kode_akun via DB
"""

from __future__ import annotations

import csv
import re
from datetime import date, datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.config.settings import settings
from app.database.models import Akun, JurnalDetail, JurnalUmum, JenisJurnal

logger = get_logger(__name__)

_DEFAULT_KEYWORD_PATH = Path(settings.KNOWLEDGE_DIR) / "datasets" / "keyword_mapping.csv"

# Format A columns
COL_TANGGAL = "tanggal"
COL_DESKRIPSI = "deskripsi"
COL_JUMLAH = "jumlah"
COL_JENIS = "jenis"
COL_KATEGORI = "kategori"

# Format B column aliases
ALIAS_TIPE = "tipe"
ALIAS_TOTAL = "total"
ALIAS_AKUN_DEBIT = "akun_debit"
ALIAS_AKUN_KREDIT = "akun_kredit"

AKUN_KAS_DEFAULT = "1-1000"
AKUN_BANK_DEFAULT = "1-1100"

# tipe (Format B) -> jenis (Format A)
TIPE_TO_JENIS: dict[str, str] = {
    "modal": "masuk",
    "penjualan": "masuk",
    "beban": "keluar",
    "beban operasional": "keluar",
    "pembelian": "keluar",
    "penyesuaian": "penyesuaian",
}

KATEGORI_FALLBACK: dict[str, tuple[str, str]] = {
    "modal": ("1-1000", "3-1000"),
    "pendapatan": ("1-1000", "4-1000"),
    "beban_operasional": ("5-9000", "1-1000"),
    "pembelian": ("1-1300", "2-1000"),
    "pembelian_aset": ("1-1400", "1-1000"),
    "pelunasan_piutang": ("1-1000", "1-1200"),
    "pelunasan_utang": ("2-1000", "1-1000"),
    "prive": ("3-2000", "1-1000"),
    "pajak": ("2-1200", "1-1000"),
    "penyesuaian": ("5-2300", "1-1400"),
}

# Sinonim nama kolom (dalam bentuk ternormalisasi) -> kolom kanonik.
# Dipakai supaya berbagai format CSV/xlsx tetap bisa diproses.
ALIAS_KOLOM: dict[str, set[str]] = {
    COL_TANGGAL: {
        "tanggal", "tgl", "date", "dates", "tanggal_transaksi", "tgl_transaksi",
        "tanggal_jurnal", "tanggal_bukti", "tgl_bukti", "hari", "hari_tanggal",
        "periode", "bulan", "tanggal_pembukuan",
    },
    COL_DESKRIPSI: {
        "deskripsi", "keterangan", "uraian", "nama", "transaksi", "deskripsi_transaksi",
        "keterangan_transaksi", "nama_transaksi", "uraian_transaksi", "description",
        "descriptions", "item", "items", "memo", "note", "notes", "catatan", "detail",
        "keterangan_penjualan", "keterangan_pembelian",
    },
    COL_JUMLAH: {
        "jumlah", "nominal", "nilai", "total", "amount", "amounts", "harga",
        "harga_total", "total_harga", "jumlah_uang", "nilai_transaksi",
        "jumlah_transaksi", "subtotal", "total_transaksi", "total_pembayaran",
        "pembayaran", "pemasukan", "pengeluaran", "uang", "jml", "jmlh", "besar",
    },
    COL_JENIS: {
        "jenis", "tipe", "type", "jenis_transaksi", "kategori_transaksi",
        "arus_kas", "cash_flow", "aliran", "jenis_arus_kas", "tipe_transaksi",
    },
    COL_KATEGORI: {
        "kategori", "category", "categories", "grup", "kelompok", "kategori_akun",
        "golongan", "label",
    },
}

# Sinonim nilai kolom "jenis" -> nilai kanonik.
JENIS_MASUK_VALUES = {
    "masuk", "pemasukan", "pendapatan", "penerimaan", "income", "debit",
    "uang_masuk", "uang masuk", "in",
}
JENIS_KELUAR_VALUES = {
    "keluar", "pengeluaran", "beban", "biaya", "expense", "out",
    "uang_keluar", "uang keluar", "pembayaran", "kredit", "cost",
}

_NON_DESKRIPSI_ALIASES = (
    ALIAS_KOLOM[COL_TANGGAL]
    | ALIAS_KOLOM[COL_JUMLAH]
    | ALIAS_KOLOM[COL_JENIS]
    | ALIAS_KOLOM[COL_KATEGORI]
    | {ALIAS_TIPE, ALIAS_TOTAL, ALIAS_AKUN_DEBIT, ALIAS_AKUN_KREDIT}
)


def _normalize_header(value) -> str:
    """Normalisasi nama kolom: lowercase, buang BOM, spasi & tanda baca -> underscore."""
    normalized = str(value).strip().lstrip("\ufeff").lower()
    normalized = re.sub(r"[\s\u00a0]+", "_", normalized)
    normalized = re.sub(r"[()\[\]{}:;.,/\\|*?<>\"'!@#%^&+=~`-]+", "_", normalized)
    normalized = re.sub(r"_+", "_", normalized)
    return normalized.strip("_")


def _normalize_jenis(value) -> str:
    v = str(value).strip().lower()
    if v in JENIS_MASUK_VALUES:
        return "masuk"
    if v in JENIS_KELUAR_VALUES:
        return "keluar"
    if v in TIPE_TO_JENIS:
        return TIPE_TO_JENIS[v]
    return v


# Kata kunci untuk mengklasifikasikan arah arus kas (pemasukan/pengeluaran).
_KLASIFIKASI_INCOME = (
    "penjualan", "jual", "omzet", "pendapatan", "pemasukan", "penerimaan",
    "income", "revenue", "sales", "terima",
)
_KLASIFIKASI_EXPENSE = (
    "pembelian", "beban", "pengeluaran", "expense", "bayar", "belanja",
    "gaji", "sewa", "listrik", "pajak", "operasional", "cost", "hpp",
    "prive", "uang keluar",
)


def _classify_jenis(value) -> str | None:
    """
    Klasifikasi nilai kolom jenis/tipe menjadi 'masuk' / 'keluar' / 'penyesuaian'
    / 'modal' / 'prive'. Pakai pencocokan kata kunci (contains) supaya nilai
    deskriptif seperti 'Penjualan F&B' atau 'Pengeluaran tunai' tetap terbaca,
    dan tidak jatuh ke default beban (yang membuat pendapatan/keuntungan hilang).
    """
    v = str(value).strip().lower()
    if not v:
        return None
    if v in JENIS_MASUK_VALUES or v in JENIS_KELUAR_VALUES:
        return _normalize_jenis(v)
    if v in TIPE_TO_JENIS:
        return TIPE_TO_JENIS[v]
    if "penyesuaian" in v or "adjust" in v:
        return "penyesuaian"
    if "modal" in v or "setoran" in v:
        return "modal"
    if "prive" in v or "ambil" in v or "penarikan" in v:
        return "prive"
    if any(k in v for k in _KLASIFIKASI_INCOME):
        return "masuk"
    if any(k in v for k in _KLASIFIKASI_EXPENSE):
        return "keluar"
    return None


def _classify_by_text(deskripsi: str, kategori: str) -> str | None:
    """Fallback klasifikasi arah arus kas dari teks deskripsi & kategori transaksi."""
    text = f"{deskripsi} {kategori}".lower()
    if any(k in text for k in _KLASIFIKASI_INCOME):
        return "masuk"
    if any(k in text for k in _KLASIFIKASI_EXPENSE):
        return "keluar"
    return None


def _build_column_map(columns) -> dict[str, str]:
    """Petakan header asli -> kolom kanonik (via nama kolom kanonik atau alias)."""
    result: dict[str, str] = {}
    used: set[str] = set()
    for col in columns:
        norm = _normalize_header(col)
        if norm in (COL_TANGGAL, COL_DESKRIPSI, COL_JUMLAH, COL_JENIS, COL_KATEGORI):
            canonical = norm
        else:
            canonical = None
            for key, aliases in ALIAS_KOLOM.items():
                if norm in aliases:
                    canonical = key
                    break
        if canonical and canonical not in used:
            result[col] = canonical
            used.add(canonical)
    return result


def _looks_like_date_column(series) -> bool:
    sample = series.dropna().head(20)
    if sample.empty:
        return False
    for v in sample:
        if isinstance(v, (datetime, date)):
            continue
        try:
            _parse_date(str(v))
        except Exception:
            return False
    return True


def _try_float(value) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    s = str(value).strip()
    if not s:
        return None
    s = re.sub(r"(?i)\b(?:rp|idr)\b", "", s)
    s = s.replace(" ", "").replace("\u00a0", "").replace(",", "")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _looks_like_amount_column(series) -> bool:
    sample = series.dropna().head(20)
    if sample.empty:
        return False
    return all(_try_float(v) is not None for v in sample)


def _detect_date_column(dataframe) -> str | None:
    for col in dataframe.columns:
        if _looks_like_date_column(dataframe[col]):
            return col
    return None


def _detect_amount_column(dataframe) -> str | None:
    candidates: list[str] = []
    for col in dataframe.columns:
        if _looks_like_amount_column(dataframe[col]):
            candidates.append(col)
    if not candidates:
        return None
    # Pilih kolom yang paling "berbentuk uang": ada nilai negatif / desimal, lalu std paling besar.
    best = candidates[0]
    best_score = -1.0
    for col in candidates:
        series = dataframe[col]
        nums = [_try_float(v) for v in series.dropna().head(50) if _try_float(v) is not None]
        has_neg = any(n < 0 for n in nums)
        has_dec = any(n != int(n) for n in nums)
        std = (pd_std(nums) if nums else 0.0)
        score = std + (10 if has_neg else 0) + (5 if has_dec else 0)
        if score > best_score:
            best_score = score
            best = col
    return best


def pd_std(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / (len(values) - 1)
    return variance ** 0.5


def _detect_description_column(dataframe) -> str | None:
    best_col = None
    best_score = -1.0
    for col in dataframe.columns:
        if _normalize_header(col) in _NON_DESKRIPSI_ALIASES:
            continue
        if _looks_like_date_column(dataframe[col]) or _looks_like_amount_column(dataframe[col]):
            continue
        strings = [str(v).strip() for v in dataframe[col].dropna().head(50) if str(v).strip()]
        if not strings:
            continue
        avg_len = sum(len(s) for s in strings) / len(strings)
        unique_ratio = len(set(strings)) / len(strings)
        score = avg_len + unique_ratio * 5
        if score > best_score:
            best_score = score
            best_col = col
    return best_col


class JurnalMappingError(Exception):
    pass


def _load_keyword_mapping(path: str | Path | None = None) -> list[dict]:
    mapping_path = Path(path) if path else _DEFAULT_KEYWORD_PATH
    if not mapping_path.exists():
        logger.warning("Keyword mapping tidak ditemukan di %s, fallback ke kategori", mapping_path)
        return []

    rows = []
    with open(mapping_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "kata_kunci": row["kata_kunci"].strip().lower(),
                "debit": row["kemungkinan_akun_debit"].strip(),
                "kredit": row["kemungkinan_akun_kredit"].strip(),
                "kategori": row["kategori_transaksi"].strip(),
            })
    return rows


def _match_keyword(deskripsi: str, keyword_mapping: list[dict]) -> dict | None:
    deskripsi_lower = deskripsi.lower()
    for entry in keyword_mapping:
        if entry["kata_kunci"] in deskripsi_lower:
            return entry
    return None


def _parse_date(val: str) -> date:
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(val.strip(), fmt).date()
        except ValueError:
            continue
    raise JurnalMappingError(f"Gagal parse tanggal: {val}")


def _parse_float(val: str) -> float:
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        return float(val)

    cleaned = str(val).strip()
    cleaned = re.sub(r"(?i)\b(?:rp|idr)\b", "", cleaned)
    cleaned = cleaned.replace(" ", "").replace("\u00a0", "")

    if "," in cleaned and "." in cleaned:
        # Format Indonesia: 1.234.567,89 -> buang titik, koma jadi desimal
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned:
        # Koma sebagai desimal: 10,5 -> 10.5
        cleaned = cleaned.replace(",", ".")
    elif "." in cleaned:
        # Titik sebagai ribuan kalau selalu grup 3 digit: 10.000 -> 10000; 10.5 -> 10.5
        parts = cleaned.split(".")
        if len(parts) > 1 and all(len(p) == 3 for p in parts[1:]) and len(parts[-1]) == 3:
            cleaned = cleaned.replace(".", "")

    if not cleaned:
        raise JurnalMappingError(f"Gagal parse angka: {val}")
    return float(cleaned)


def _determine_akun_pair(
    jenis: str,
    kategori: str,
    keyword_entry: dict | None,
) -> tuple[str, str]:
    jenis_lower = jenis.strip().lower()

    if jenis_lower == "penyesuaian" and keyword_entry:
        return keyword_entry["debit"], keyword_entry["kredit"]

    if jenis_lower == "modal":
        # Setoran modal: kas bertambah, kredit akun Modal Pemilik (3-1000)
        if keyword_entry:
            return AKUN_KAS_DEFAULT, keyword_entry["kredit"]
        return AKUN_KAS_DEFAULT, "3-1000"

    if jenis_lower == "prive":
        # Penarikan prive pemilik: debit Prive (3-2000), kredit kas
        return "3-2000", AKUN_KAS_DEFAULT

    if jenis_lower == "masuk":
        if keyword_entry:
            return AKUN_KAS_DEFAULT, keyword_entry["kredit"]
        fallback = KATEGORI_FALLBACK.get(kategori, ("1-1000", "4-1000"))
        return AKUN_KAS_DEFAULT, fallback[1]

    if keyword_entry:
        return keyword_entry["debit"], AKUN_KAS_DEFAULT
    fallback = KATEGORI_FALLBACK.get(kategori, ("5-9000", "1-1000"))
    return fallback[0], AKUN_KAS_DEFAULT


def _build_name_to_code_map(akun_rows: list[Akun]) -> dict[str, str]:
    """Build lowercase nama_akun -> kode_akun mapping."""
    return {a.nama_akun.strip().lower(): a.kode_akun for a in akun_rows}


def _resolve_akun_name(name: str, name_to_code: dict[str, str], akun_map: dict[str, str]) -> str | None:
    """Resolve account name to account code. Exact match first, then fuzzy contains."""
    name_lower = name.strip().lower()
    if not name_lower:
        return None

    # Exact match
    code = name_to_code.get(name_lower)
    if code and code in akun_map:
        return code

    # Fuzzy contains match
    candidates = []
    for nama, kode in name_to_code.items():
        if kode not in akun_map:
            continue
        if name_lower in nama or nama in name_lower:
            candidates.append((nama, kode))

    if candidates:
        best = min(candidates, key=lambda x: len(x[0]))
        return best[1]

    return None


def auto_journal_from_dataframe(
    db: Session,
    dataframe,
    uploaded_file_id: str,
    user_id: str,
    filename_stem: str,
    keyword_mapping_path: str | Path | None = None,
) -> int:
    """
    Buat jurnal otomatis dari DataFrame transaksi via batch insert.

    Mendukung 2 format:
      - Format A: kolom tanggal, deskripsi, jumlah, jenis, kategori
      - Format B: kolom tanggal, tipe, total, akun_debit, akun_kredit (+ kolom lain)

    Returns: jumlah jurnal yang berhasil dibuat.
    """
    keyword_mapping = _load_keyword_mapping(keyword_mapping_path)

    # --- 1. Normalisasi header & petakan ke kolom kanonik (alias) ---
    column_map = _build_column_map(dataframe.columns)
    if column_map:
        dataframe = dataframe.rename(columns=column_map)

    # --- 2. Fallback deteksi kolom lewat isi data (bukan nama header) ---
    if COL_TANGGAL not in dataframe.columns:
        detected = _detect_date_column(dataframe)
        if detected:
            dataframe = dataframe.rename(columns={detected: COL_TANGGAL})

    if COL_JUMLAH not in dataframe.columns:
        detected = _detect_amount_column(dataframe)
        if detected:
            dataframe = dataframe.rename(columns={detected: COL_JUMLAH})

    if COL_DESKRIPSI not in dataframe.columns:
        detected = _detect_description_column(dataframe)
        if detected:
            dataframe = dataframe.rename(columns={detected: COL_DESKRIPSI})

    cols = set(dataframe.columns)

    # --- Normalize column aliases ---
    has_akun_cols = ALIAS_AKUN_DEBIT in cols and ALIAS_AKUN_KREDIT in cols
    has_jenis = COL_JENIS in cols

    # --- Validasi kolom minimum (hanya tanggal & jumlah yang wajib) ---
    if COL_TANGGAL not in cols:
        raise JurnalMappingError(
            "Tidak ditemukan kolom tanggal. Diperlukan kolom tanggal "
            "(contoh nama: 'tanggal', 'tgl', 'date')."
        )
    if COL_JUMLAH not in cols:
        raise JurnalMappingError(
            "Tidak ditemukan kolom jumlah/nominal. Diperlukan kolom nominal transaksi "
            "(contoh nama: 'jumlah', 'total', 'nominal', 'amount')."
        )

    if not has_jenis and not has_akun_cols:
        logger.info("Kolom 'jenis' tidak ditemukan, default ke 'masuk' per transaksi.")

    # --- Pre-fetch: semua akun aktif ---
    akun_rows: list[Akun] = db.query(Akun).filter(Akun.is_active.is_(True)).all()
    akun_map: dict[str, str] = {a.kode_akun: a.id for a in akun_rows}
    name_to_code: dict[str, str] = _build_name_to_code_map(akun_rows)

    # --- Pre-fetch: no_bukti yang sudah ada (scoped ke user ini saja) ---
    existing_bukti: set[str] = {
        r[0] for r in db.query(JurnalUmum.no_bukti).filter(JurnalUmum.created_by_id == user_id).all()
    }

    # --- Translate tipe -> jenis values if needed ---
    if has_jenis and not has_akun_cols:
        sample_values = set(str(v).strip().lower() for v in dataframe[COL_JENIS].head(20))
        if sample_values & set(TIPE_TO_JENIS.keys()):
            dataframe[COL_JENIS] = dataframe[COL_JENIS].apply(
                lambda v: TIPE_TO_JENIS.get(str(v).strip().lower(), str(v).strip().lower())
            )

    # --- Build semua jurnal di memory ---
    all_jurnals: list[JurnalUmum] = []
    errors: list[str] = []
    used_bukti: set[str] = set()

    for row_num, row in enumerate(dataframe.itertuples(index=False), start=1):
        try:
            tanggal = _parse_date(str(getattr(row, COL_TANGGAL)))
            deskripsi = str(getattr(row, COL_DESKRIPSI)).strip() if COL_DESKRIPSI in cols else "Transaksi"
            jumlah = _parse_float(str(getattr(row, COL_JUMLAH)))

            if jumlah == 0:
                continue
            if jumlah < 0:
                jumlah = abs(jumlah)
                negatif = True
            else:
                negatif = False

            # no_bukti unik per upload (masukkan cuplikan upload_id) supaya file
            # dengan nama sama bisa diupload ulang tanpa bentrok nomor bukti
            no_bukti = f"AUTO-{filename_stem[:6].upper()}-{str(uploaded_file_id)[:8]}-{row_num:04d}"
            if no_bukti in existing_bukti or no_bukti in used_bukti:
                errors.append(f"Baris {row_num + 1}: No. bukti {no_bukti} sudah ada")
                continue
            used_bukti.add(no_bukti)

            # --- Determine akun pair ---
            if has_akun_cols:
                raw_debit = str(getattr(row, ALIAS_AKUN_DEBIT)).strip()
                raw_kredit = str(getattr(row, ALIAS_AKUN_KREDIT)).strip()

                akun_debit = _resolve_akun_name(raw_debit, name_to_code, akun_map)
                akun_kredit = _resolve_akun_name(raw_kredit, name_to_code, akun_map)

                if not akun_debit:
                    errors.append(f"Baris {row_num + 1}: Akun debit '{raw_debit}' tidak ditemukan di chart of accounts")
                    continue
                if not akun_kredit:
                    errors.append(f"Baris {row_num + 1}: Akun kredit '{raw_kredit}' tidak ditemukan di chart of accounts")
                    continue
            else:
                raw_jenis = str(getattr(row, COL_JENIS)).strip() if has_jenis else ""
                has_kategori = COL_KATEGORI in cols
                kategori = str(getattr(row, COL_KATEGORI)).strip().lower() if has_kategori else ""
                jenis = _classify_jenis(raw_jenis)
                if jenis is None:
                    jenis = _classify_by_text(deskripsi, kategori)
                if jenis is None:
                    jenis = "masuk"
                if negatif and jenis == "masuk":
                    jenis = "keluar"
                keyword_entry = _match_keyword(deskripsi, keyword_mapping)
                akun_debit, akun_kredit = _determine_akun_pair(jenis, kategori, keyword_entry)

            if akun_debit not in akun_map:
                errors.append(f"Baris {row_num + 1}: Kode akun debit '{akun_debit}' tidak ada di DB")
                continue
            if akun_kredit not in akun_map:
                errors.append(f"Baris {row_num + 1}: Kode akun kredit '{akun_kredit}' tidak ada di DB")
                continue

            jurnal = JurnalUmum(
                no_bukti=no_bukti,
                tanggal=tanggal,
                deskripsi=deskripsi,
                jenis=JenisJurnal.UMUM,
                created_by_id=user_id,
                sumber_upload_id=uploaded_file_id,
            )
            jurnal.detail.append(
                JurnalDetail(
                    akun_id=akun_map[akun_debit],
                    urutan=0,
                    debit=jumlah,
                    kredit=0,
                    keterangan=deskripsi,
                )
            )
            jurnal.detail.append(
                JurnalDetail(
                    akun_id=akun_map[akun_kredit],
                    urutan=1,
                    debit=0,
                    kredit=jumlah,
                    keterangan=deskripsi,
                )
            )
            all_jurnals.append(jurnal)

        except Exception as exc:
            errors.append(f"Baris {row_num + 1}: {exc}")

    # Single batch insert + single commit
    if all_jurnals:
        db.add_all(all_jurnals)
        db.commit()
        logger.info("Batch auto-jurnal selesai: %d jurnal dari %d baris transaksi.", len(all_jurnals), len(dataframe))
    else:
        logger.warning("Tidak ada jurnal yang dibuat dari %d baris transaksi.", len(dataframe))

    if errors:
        logger.warning(
            "Auto-jurnal selesai dengan %d error dari %d baris: %s",
            len(errors), len(dataframe), "; ".join(errors[:5]),
        )

    return len(all_jurnals)
