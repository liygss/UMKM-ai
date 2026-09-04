function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTanggalCetak() {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function rp(val) {
  if (val === undefined || val === null) return '-'
  const abs = Math.abs(val)
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(abs)
  if (val < 0) return `(${formatted})`
  return formatted
}

const KICKER = `Laporan Keuangan`
const BRAND = `Finora`

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: white; }
body {
  font-family: 'Inter', -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
  font-size: 9.5pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@page { size: A4 portrait; margin: 14mm 12mm; }

.page {
  display: flex;
  flex-direction: column;
  min-height: 268mm;
  padding: 0;
}
.cover { page-break-inside: avoid; }

/* ===== COVER PAGE ===== */
.cover { position: relative; padding: 8mm; }
.cover-frame {
  position: absolute; top: 4mm; left: 4mm; right: 4mm; bottom: 4mm;
  border: 2px solid #1e3a8a; border-radius: 4px; pointer-events: none; z-index: 0;
}
.cover-frame::after {
  content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px;
  border: 1px solid #bfdbfe; border-radius: 2px;
}
.cover > *:not(.cover-frame) { position: relative; z-index: 1; }
.cover-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2mm 2mm 8px; border-bottom: 2px solid #1e3a8a;
}
.cover-top { display: flex; align-items: center; gap: 14px; }
.cover-logo {
  width: 50px; height: 50px; border-radius: 12px;
  overflow: hidden; flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.25);
}
.cover-logo img { width: 50px; height: 50px; object-fit: cover; }
.cover-brand-name {
  font-size: 19pt; font-weight: 800; color: #0f172a;
  letter-spacing: 0.04em; line-height: 1.1;
}
.cover-brand-tag { font-size: 8pt; color: #64748b; font-weight: 500; margin-top: 2px; letter-spacing: 0.02em; }
.cover-stamp {
  text-align: center; padding: 6px 12px;
  border: 1.5px solid #1e3a8a; border-radius: 6px; background: #f8fafc;
}
.cover-stamp-main { display: block; font-size: 8pt; font-weight: 800; color: #1e3a8a; letter-spacing: 0.14em; }
.cover-stamp-sub { display: block; font-size: 6.5pt; font-weight: 600; color: #64748b; letter-spacing: 0.08em; margin-top: 2px; }
.cover-center { text-align: center; margin-top: 22mm; }
.cover-kicker {
  display: inline-block; font-size: 8pt; font-weight: 800;
  letter-spacing: 0.34em; color: #1e3a8a; text-transform: uppercase;
  margin-bottom: 12px;
  padding: 4px 16px; border: 1px solid #bfdbfe; border-radius: 999px;
  background: #eff6ff;
}
.cover-title {
  font-size: 33pt; font-weight: 900; color: #0f172a;
  letter-spacing: -0.02em; margin: 0 0 10px; line-height: 1.0;
}
.cover-sub {
  font-size: 9.5pt; color: #64748b; line-height: 1.6;
  max-width: 120mm; margin: 0 auto;
}
.cover-ornament {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 16px auto 0; width: 60mm;
}
.cover-ornament::before, .cover-ornament::after {
  content: ''; flex: 1; height: 1px; background: #1e3a8a;
}
.cover-ornament span { color: #1e3a8a; font-size: 9pt; line-height: 1; }
.cover-meta { margin: 18mm auto 0; max-width: 150mm; border-collapse: collapse; width: 100%; }
.cover-meta td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
.cover-meta tr:last-child td { border-bottom: none; }
.cover-meta-label {
  width: 32%; font-size: 7.5pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;
  border-right: 1px solid #e2e8f0;
}
.cover-meta-value { font-size: 10.5pt; font-weight: 700; color: #0f172a; line-height: 1.35; }
.cover-meta-small { display: block; font-size: 8pt; color: #64748b; margin-top: 2px; font-weight: 500; }
.cover-toc { margin: 12mm auto 0; max-width: 150mm; }
.cover-toc-title {
  font-size: 9pt; font-weight: 800; color: #1e3a8a;
  text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 10px;
  display: flex; align-items: center; gap: 10px;
}
.cover-toc-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, #bfdbfe, transparent); }
.cover-toc-list { list-style: none; margin: 0; padding: 0; }
.cover-toc-item { display: flex; align-items: center; gap: 12px; margin-bottom: 7px; }
.cover-toc-num {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: #1e3a8a; color: white; border: 1.5px solid #1e3a8a;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 9.5pt; font-weight: 800;
}
.cover-toc-line { flex: 1; border-bottom: 1px dotted #cbd5e1; }
.cover-toc-name { font-size: 10pt; font-weight: 600; color: #334155; white-space: nowrap; padding-right: 10px; }
.cover-seal {
  position: absolute; right: 14mm; bottom: 16mm;
  width: 34mm; height: 34mm; border: 2px solid #1e3a8a; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; color: #1e3a8a; opacity: 0.9;
}
.cover-seal-monogram { font-size: 16pt; font-weight: 900; line-height: 1; }
.cover-seal-text { font-size: 5.5pt; font-weight: 700; letter-spacing: 0.1em; margin-top: 4px; text-transform: uppercase; }
.cover-foot { margin-top: auto; padding-top: 14px; }
.cover-foot-line { height: 1.5px; background: #1e3a8a; margin-bottom: 8px; }
.cover-foot-row { display: flex; justify-content: space-between; align-items: center; }
.cover-foot span { font-size: 7pt; color: #64748b; }
.cover-pageno {
  font-size: 7pt; font-weight: 700; color: #1e3a8a; letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Header */
.hdr { margin-bottom: 18px; }
.hdr-title {
  font-size: 13.5pt; font-weight: 700; color: #1d4ed8;
  margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.08em;
}
.hdr-subtitle { font-size: 9pt; color: #64748b; margin: 0 0 12px; }
.hdr-divider { height: 1px; background: #e2e8f0; }

/* Tables */
.tbl { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 16px; }
.tbl thead { display: table-header-group; }
.tbl thead tr { background: linear-gradient(135deg, #1e40af, #2563eb); }
.tbl th {
  padding: 8px 12px; font-weight: 700; font-size: 7.5pt;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: white; text-align: left; border: none;
}
.tbl td { padding: 7px 12px; border-bottom: 1px solid #eef2f7; vertical-align: top; }
.tbl tbody tr { page-break-inside: avoid; }
.tbl tbody tr:last-child td { border-bottom: 2px solid #dbe4f0; }
.tbl tfoot tr td { border: none; }
.r { text-align: right; }
.m {
  font-family: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Roboto Mono', Consolas, monospace;
  font-size: 8.5pt; color: #334155; font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}
.nm { font-weight: 500; color: #1e293b; }

/* Row striping */
.even { background: white; }
.odd { background: #f8fafc; }

/* Kategori badge */
.kat {
  display: inline-block; padding: 2px 10px;
  background: #eff6ff; color: #1d4ed8; border-radius: 999px;
  font-size: 7.5pt; font-weight: 600; letter-spacing: 0.02em;
}

/* Section headers */
.sec td {
  padding: 10px 12px !important;
  font-size: 9.5pt; font-weight: 700; color: #1e40af;
  background: #eff6ff !important;
  border-bottom: 1px solid #bfdbfe !important; border-top: none !important;
}
.sec-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  background: linear-gradient(135deg, #1e40af, #2563eb);
  color: white; border-radius: 6px;
  font-size: 9pt; font-weight: 700; margin-right: 8px; vertical-align: middle;
}

/* Subtotal */
.sub td {
  padding: 7px 12px !important;
  border-top: 1px solid #bfdbfe !important;
  border-bottom: 1px solid #bfdbfe !important;
  border-left: 4px solid #60a5fa !important;
  font-weight: 600; color: #334155; background: #f8fafc !important;
}

/* Total */
.tot td {
  padding: 8px 12px !important;
  border-top: 2px solid #1d4ed8 !important;
  border-bottom: 2px solid #1d4ed8 !important;
  border-left: 4px solid #1d4ed8 !important;
  font-weight: 800; font-size: 10pt; color: #0f172a;
  background: #eff6ff !important;
}

/* Grand total / Final */
.grand td, .final td {
  padding: 10px 12px !important;
  border-top: 2px solid #1e40af !important;
  border-bottom: 2px solid #1e40af !important;
  border-left: 5px solid #1e40af !important;
  font-weight: 800; font-size: 10.5pt; color: white;
  background: linear-gradient(135deg, #1e40af, #2563eb) !important;
}

/* Status */
.status-line { margin-top: 12px; font-size: 9pt; color: #475569; display: flex; align-items: center; gap: 8px; }
.status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 14px; border-radius: 999px;
  font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
}
.status-ok { background: #ecfdf5; color: #059669; }
.status-err { background: #fef2f2; color: #dc2626; }
.dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot-ok { background: #10b981; }
.dot-err { background: #ef4444; }

/* CALK */
.sec-block { margin-bottom: 18px; page-break-inside: avoid; }
.sec-title {
  font-size: 10pt; font-weight: 700; color: #0f172a;
  margin: 0 0 10px; padding: 8px 12px;
  background: #eff6ff; border-left: 4px solid #2563eb;
  border-radius: 0 6px 6px 0; display: flex; align-items: center;
}
.sec-title .sec-num { font-size: 8.5pt; height: 20px; width: 20px; }
.list { margin: 0; padding-left: 20px; font-size: 9pt; line-height: 1.8; color: #475569; }
.list li { margin-bottom: 4px; }
.compact td { padding: 5px 10px; font-size: 8.5pt; }
.italic { font-style: italic; color: #64748b; font-size: 8.5pt; }

/* Footer */
.ftr { margin-top: auto; padding-top: 22px; }
.ftr-line { height: 2px; background: linear-gradient(90deg, #2563eb, #bfdbfe, transparent); margin-bottom: 10px; }
.ftr-content { display: flex; justify-content: space-between; align-items: center; }
.ftr-text { font-size: 7pt; color: #94a3b8; }
`

const LOGO_SVG = `<img src="data:image/jpeg;base64,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" width="24" height="24" style="border-radius:4px;object-fit:cover;" />`

const TOC_ITEMS = [
  'Neraca Saldo',
  'Laporan Laba Rugi',
  'Laporan Posisi Keuangan',
  'Catatan Atas Laporan Keuangan (CALK)',
]

function coverPage(date, user, startDate, endDate) {
  const dateLabel = startDate && endDate
    ? `${formatTanggalIndo(startDate)} - ${formatTanggalIndo(endDate)}`
    : formatTanggalIndo(date)

  const toc = TOC_ITEMS.map((name, i) => `
    <li class="cover-toc-item">
      <span class="cover-toc-num">${i + 1}</span>
      <span class="cover-toc-name">${name}</span>
      <span class="cover-toc-line"></span>
    </li>`).join('')

  return `
  <div class="page cover">
    <div class="cover-frame"></div>
    <div class="cover-header">
      <div class="cover-top">
        <div class="cover-logo">${LOGO_SVG}</div>
        <div>
          <div class="cover-brand-name">${BRAND}</div>
          <div class="cover-brand-tag">Sistem Akuntansi Cerdas untuk UMKM</div>
        </div>
      </div>
      <div class="cover-stamp">
        <span class="cover-stamp-main">DOKUMEN RESMI</span>
        <span class="cover-stamp-sub">BERBASIS SAK EMKM</span>
      </div>
    </div>
    <div class="cover-center">
      <span class="cover-kicker">${KICKER}</span>
      <h1 class="cover-title">Laporan Keuangan</h1>
      <p class="cover-sub">Disusun sesuai Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM)</p>
      <div class="cover-ornament"><span>&#9670;</span></div>
    </div>
    <table class="cover-meta">
      <tr>
        <td class="cover-meta-label">Perusahaan</td>
        <td class="cover-meta-value">${user?.company_name || 'Nama Perusahaan'}${user?.email ? `<span class="cover-meta-small">${user.email}</span>` : ''}</td>
      </tr>
      <tr>
        <td class="cover-meta-label">Periode</td>
        <td class="cover-meta-value">Per ${dateLabel}</td>
      </tr>
      <tr>
        <td class="cover-meta-label">Dicetak</td>
        <td class="cover-meta-value">${formatTanggalCetak()}</td>
      </tr>
    </table>
    <div class="cover-toc">
      <div class="cover-toc-title">Daftar Isi</div>
      <ul class="cover-toc-list">${toc}</ul>
    </div>
    <div class="cover-seal">
      <div class="cover-seal-monogram">${BRAND.charAt(0)}</div>
      <div class="cover-seal-text">Dokumen Sah</div>
    </div>
    <div class="cover-foot">
      <div class="cover-foot-line"></div>
      <div class="cover-foot-row">
        <span>Dokumen ini dihasilkan secara otomatis oleh ${BRAND}</span>
        <span class="cover-pageno">Halaman 1</span>
      </div>
    </div>
  </div>`
}

function header(title, date, startDate, endDate) {
  const dateLabel = startDate && endDate
    ? `${formatTanggalIndo(startDate)} - ${formatTanggalIndo(endDate)}`
    : formatTanggalIndo(date)

  return `
  <div class="hdr">
    <h2 class="hdr-title">${title}</h2>
    <p class="hdr-subtitle">Per ${dateLabel}</p>
    <div class="hdr-divider"></div>
  </div>`
}

function footer() {
  return `
  <div class="ftr">
    <div class="ftr-line"></div>
    <div class="ftr-content">
      <span class="ftr-text">Dibuat oleh ${BRAND} - Sistem Akuntansi Cerdas</span>
      <span class="ftr-text">${formatTanggalCetak()}</span>
    </div>
  </div>`
}

function statusBadge(isBalance) {
  const cls = isBalance ? 'status-ok' : 'status-err'
  const dotCls = isBalance ? 'dot-ok' : 'dot-err'
  const text = isBalance ? 'SALDO SEIMBANG' : 'TIDAK SEIMBANG'
  return `<div class="status-line">Status: <span class="status ${cls}"><span class="dot ${dotCls}"></span>${text}</span></div>`
}

function neracaSaldo(data, date, startDate, endDate) {
  const rows = (data.baris || []).map((r, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td class="m">${r.kode_akun}</td>
      <td class="nm">${r.nama_akun}</td>
      <td><span class="kat">${r.kategori}</span></td>
      <td class="r m">${r.debit > 0 ? rp(r.debit) : '\u2014'}</td>
      <td class="r m">${r.kredit > 0 ? rp(r.kredit) : '\u2014'}</td>
    </tr>`).join('')

  return `
  <div class="page">
    ${header('LAPORAN NERACA SALDO', date, startDate, endDate)}
    <table class="tbl">
      <thead><tr>
        <th style="width:12%">Kode</th>
        <th style="width:35%">Nama Akun</th>
        <th style="width:18%">Kategori</th>
        <th style="width:17%" class="r">Debit</th>
        <th style="width:18%" class="r">Kredit</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="tot">
          <td colspan="3">TOTAL</td>
          <td class="r m">${rp(data.total_debit)}</td>
          <td class="r m">${rp(data.total_kredit)}</td>
        </tr>
      </tfoot>
    </table>
    ${statusBadge(data.is_balance)}
    ${footer()}
  </div>`
}

function sectionRow(num, title) {
  return `<tr class="sec"><td colspan="3"><span class="sec-num">${num}</span>${title}</td></tr>`
}

function itemRow(items) {
  return (items || []).map((r, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td class="m">${r.kode_akun}</td>
      <td class="nm">${r.nama_akun}</td>
      <td class="r m">${rp(r.nilai)}</td>
    </tr>`).join('')
}

function subtotalRow(label, value) {
  return `<tr class="sub"><td colspan="2">${label}</td><td class="r m">${rp(value)}</td></tr>`
}

function labaRugi(data, date, startDate, endDate) {
  return `
  <div class="page">
    ${header('LAPORAN LABA RUGI', date, startDate, endDate)}
    <table class="tbl">
      <thead><tr>
        <th style="width:15%">Kode</th>
        <th style="width:55%">Uraian</th>
        <th style="width:30%" class="r">Nilai (Rp)</th>
      </tr></thead>
      <tbody>
        ${sectionRow(1, 'PENDAPATAN')}
        ${itemRow(data.pendapatan)}
        ${subtotalRow('Total Pendapatan', data.total_pendapatan)}

        ${sectionRow(2, 'HARGA POKOK PENJUALAN (HPP)')}
        ${itemRow(data.hpp)}
        ${subtotalRow('Total HPP', data.total_hpp)}

        <tr class="grand"><td colspan="2">LABA KOTOR</td><td class="r m">${rp(data.laba_kotor)}</td></tr>

        ${sectionRow(3, 'BEBAN OPERASIONAL')}
        ${itemRow(data.beban_operasional)}
        ${subtotalRow('Total Beban Operasional', data.total_beban_operasional)}

        <tr class="final"><td colspan="2">LABA BERSIH</td><td class="r m">${rp(data.laba_bersih)}</td></tr>
      </tbody>
    </table>
    ${footer()}
  </div>`
}

function posisiKeuangan(data, date, startDate, endDate) {
  return `
  <div class="page">
    ${header('LAPORAN POSISI KEUANGAN', date, startDate, endDate)}
    <table class="tbl">
      <thead><tr>
        <th style="width:15%">Kode</th>
        <th style="width:55%">Uraian</th>
        <th style="width:30%" class="r">Nilai (Rp)</th>
      </tr></thead>
      <tbody>
        ${sectionRow(1, 'ASET')}
        ${itemRow(data.aset)}
        ${subtotalRow('Total Aset', data.total_aset)}

        ${sectionRow(2, 'LIABILITAS')}
        ${itemRow(data.liabilitas)}
        ${subtotalRow('Total Liabilitas', data.total_liabilitas)}

        ${sectionRow(3, 'MODAL')}
        ${itemRow(data.modal)}
        ${subtotalRow('Total Modal', data.total_modal)}

        ${subtotalRow('Laba/Rugi Berjalan', data.laba_rugi_berjalan)}

        <tr class="final"><td colspan="2">TOTAL LIABILITAS DAN MODAL</td><td class="r m">${rp(data.total_liabilitas_dan_modal)}</td></tr>
      </tbody>
    </table>
    ${statusBadge(data.is_balance)}
    ${footer()}
  </div>`
}

function calk(data, date, startDate, endDate) {
  let sections = ''
  let num = 1

  if (data.kebijakan_akuntansi?.length > 0) {
    const items = data.kebijakan_akuntansi.map(k => `<li>${k}</li>`).join('')
    sections += `
    <div class="sec-block">
      <h3 class="sec-title"><span class="sec-num">${num}</span>Kebijakan Akuntansi</h3>
      <ol class="list">${items}</ol>
    </div>`
    num++
  }

  const tableSections = [
    { title: 'Rincian Aset', items: data.rincian_aset },
    { title: 'Rincian Liabilitas', items: data.rincian_liabilitas },
    { title: 'Rincian Pendapatan', items: data.rincian_pendapatan },
    { title: 'Rincian Beban', items: data.rincian_beban },
  ]

  for (const sec of tableSections) {
    if (sec.items?.length > 0) {
      const rows = sec.items.map((r, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td class="m">${r.kode_akun}</td>
          <td class="nm">${r.nama_akun}</td>
          <td class="italic">${r.catatan || '-'}</td>
          <td class="r m">${rp(r.nilai)}</td>
        </tr>`).join('')

      sections += `
      <div class="sec-block">
        <h3 class="sec-title"><span class="sec-num">${num}</span>${sec.title}</h3>
        <table class="tbl compact">
          <thead><tr>
            <th style="width:12%">Kode</th>
            <th style="width:38%">Nama Akun</th>
            <th style="width:30%">Catatan</th>
            <th style="width:20%" class="r">Nilai (Rp)</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
      num++
    }
  }

  if (data.catatan_tambahan?.length > 0) {
    const items = data.catatan_tambahan.map(c => `<li>${c}</li>`).join('')
    sections += `
    <div class="sec-block">
      <h3 class="sec-title"><span class="sec-num">${num}</span>Catatan Tambahan</h3>
      <ol class="list">${items}</ol>
    </div>`
  }

  return `
  <div class="page">
    ${header('CATATAN ATAS LAPORAN KEUANGAN (CALK)', date, startDate, endDate)}
    ${sections}
    ${footer()}
  </div>`
}

const BUILDERS = {
  'neraca-saldo': neracaSaldo,
  'laba-rugi': labaRugi,
  'posisi-keuangan': posisiKeuangan,
  'calk': calk,
}

export function buildReportHtml(tab, data, date, _user) {
  const builder = BUILDERS[tab]
  if (!builder || !data) return ''

  return `<style>${CSS}</style>${builder(data, date)}`
}

export function buildReportFullHtml(tab, data, date, _user) {
  const builder = BUILDERS[tab]
  if (!builder || !data) return ''

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${CSS}</style>
</head>
<body>
  ${builder(data, date)}
</body>
</html>`
}

export function buildAllReportsFullHtml(allData, date, user, startDate, endDate) {
  if (!allData) return ''

  const pages = []
  for (const tab of ['neraca-saldo', 'laba-rugi', 'posisi-keuangan', 'calk']) {
    const builder = BUILDERS[tab]
    const data = allData[tab]
    if (builder && data) {
      pages.push(builder(data, date, startDate, endDate))
    }
  }

  if (pages.length === 0) return ''

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${CSS}</style>
</head>
<body>
  ${coverPage(date, user, startDate, endDate)}
  ${pages.join('\n')}
</body>
</html>`
}
