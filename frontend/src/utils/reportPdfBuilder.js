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

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: white; }
body {
  font-family: -apple-system, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
  font-size: 10pt;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@page { size: A4 portrait; margin: 12mm 10mm; }

.page {
  display: flex;
  flex-direction: column;
  min-height: 273mm;
  padding: 0;
  page-break-after: always;
}
.page:last-child { page-break-after: auto; }

/* ===== COVER PAGE ===== */
.cover { position: relative; }
.cover-band {
  height: 6mm; border-radius: 3mm;
  background: linear-gradient(90deg, #1D4ED8, #2563EB 40%, #60A5FA 70%, #1D4ED8);
  background-size: 300% 100%;
}
.cover-top {
  display: flex; align-items: center; gap: 16px;
  margin-top: 14mm;
}
.cover-logo {
  width: 58px; height: 58px; border-radius: 16px;
  background: linear-gradient(135deg, #1D4ED8, #3B82F6);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.35);
}
.cover-logo svg { width: 32px; height: 32px; }
.cover-brand-name {
  font-size: 19pt; font-weight: 800; color: #0f172a;
  letter-spacing: -0.02em; line-height: 1.1;
}
.cover-brand-tag { font-size: 8.5pt; color: #64748b; font-weight: 500; margin-top: 3px; }
.cover-center { text-align: center; margin-top: 30mm; }
.cover-kicker {
  display: inline-block; font-size: 8pt; font-weight: 800;
  letter-spacing: 0.35em; color: #2563EB; text-transform: uppercase;
  margin-bottom: 8px;
}
.cover-title {
  font-size: 34pt; font-weight: 900; color: #0f172a;
  letter-spacing: -0.03em; margin: 0 0 10px; line-height: 1.05;
}
.cover-sub {
  font-size: 10pt; color: #64748b; line-height: 1.65;
  max-width: 120mm; margin: 0 auto;
}
.cover-divider {
  width: 46mm; height: 3px; margin: 16px auto 0;
  background: linear-gradient(90deg, #1D4ED8, #60A5FA);
  border-radius: 3px;
}
.cover-meta {
  display: flex; gap: 12px; margin-top: 24mm;
}
.cover-meta-block {
  flex: 1; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 13px 16px; background: #f8fafc;
}
.cover-meta-label {
  display: block; font-size: 6.8pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.09em;
  color: #94a3b8; margin-bottom: 5px;
}
.cover-meta-value { display: block; font-size: 10pt; font-weight: 700; color: #0f172a; line-height: 1.35; }
.cover-meta-small { display: block; font-size: 8pt; color: #64748b; margin-top: 3px; }
.cover-toc { margin-top: 26mm; }
.cover-toc-title {
  font-size: 9pt; font-weight: 800; color: #2563EB;
  text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 10px;
}
.cover-toc-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px;
  margin-bottom: 8px; background: white;
}
.cover-toc-num {
  width: 27px; height: 27px; border-radius: 7px; flex-shrink: 0;
  background: linear-gradient(135deg, #1D4ED8, #2563EB); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 10pt; font-weight: 800;
}
.cover-toc-name { font-size: 10pt; font-weight: 600; color: #334155; }
.cover-foot { margin-top: auto; }
.cover-foot-line {
  height: 2px; margin-bottom: 10px;
  background: linear-gradient(90deg, #2563EB, #BFDBFE, transparent);
}
.cover-foot span { font-size: 7pt; color: #94a3b8; }

/* Header */
.hdr { margin-bottom: 22px; }
.hdr-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.hdr-left { display: flex; align-items: center; gap: 14px; }
.hdr-logo {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #2563EB, #60A5FA);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}
.hdr-logo svg { width: 26px; height: 26px; }
.hdr-company {
  font-size: 17pt; font-weight: 800; color: #0f172a;
  letter-spacing: -0.03em; margin: 0; line-height: 1.15;
}
.hdr-email { font-size: 8pt; color: #94a3b8; margin: 3px 0 0; }
.hdr-badge {
  display: inline-block; padding: 5px 14px;
  background: linear-gradient(135deg, #2563EB, #60A5FA);
  color: white; border-radius: 20px;
  font-size: 7.5pt; font-weight: 700; letter-spacing: 0.06em;
}
.hdr-divider {
  height: 1px;
  background: linear-gradient(90deg, #e2e8f0, #BFDBFE, transparent);
  margin-bottom: 14px;
}
.hdr-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
.hdr-title {
  font-size: 13pt; font-weight: 700; color: #2563EB;
  margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.1em;
}
.hdr-subtitle { font-size: 9pt; color: #64748b; margin: 0; }
.hdr-meta { text-align: right; }
.hdr-meta-label { display: block; font-size: 7pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.hdr-meta-value { display: block; font-size: 8pt; color: #475569; font-weight: 500; }

/* Tables */
.tbl { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 14px; }
.tbl thead { display: table-header-group; }
.tbl thead tr { background: linear-gradient(135deg, #1D4ED8, #2563EB); }
.tbl th {
  padding: 9px 14px; font-weight: 700; font-size: 7.5pt;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: white; text-align: left; border: none;
}
.tbl td { padding: 7px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
.tbl tbody tr { page-break-inside: avoid; }
.tbl tbody tr:last-child td { border-bottom: 2px solid #cbd5e1; }
.r { text-align: right; }
.m { font-family: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', monospace; font-size: 8.5pt; color: #334155; }
.nm { font-weight: 500; color: #1e293b; }

/* Row striping */
.even { background: white; }
.odd { background: #f8fafc; }

/* Kategori badge */
.kat {
  display: inline-block; padding: 2px 10px;
  background: #EFF6FF; color: #2563EB; border-radius: 12px;
  font-size: 7.5pt; font-weight: 600; letter-spacing: 0.02em;
}

/* Section headers */
.sec td {
  padding: 10px 14px 7px !important;
  font-size: 9.5pt; font-weight: 700; color: #1D4ED8;
  background: #EFF6FF !important;
  border-bottom: 2px solid #BFDBFE !important; border-top: none !important;
}
.sec-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  background: linear-gradient(135deg, #1D4ED8, #2563EB);
  color: white; border-radius: 6px;
  font-size: 9px; font-weight: 700; margin-right: 8px; vertical-align: middle;
}

/* Subtotal */
.sub td {
  padding: 8px 14px !important;
  border-top: 1px solid #BFDBFE !important;
  border-bottom: 1px solid #BFDBFE !important;
  border-left: 4px solid #60A5FA !important;
  font-weight: 600; color: #334155; background: #F8FAFC !important;
}

/* Total */
.tot td {
  padding: 9px 14px !important;
  border-top: 2px solid #1D4ED8 !important;
  border-bottom: 2px solid #1D4ED8 !important;
  border-left: 4px solid #1D4ED8 !important;
  font-weight: 800; font-size: 10pt; color: #0f172a;
  background: #EFF6FF !important;
}

/* Grand total / Final */
.grand td, .final td {
  padding: 11px 14px !important;
  border-top: 3px double #1D4ED8 !important;
  border-bottom: 3px double #1D4ED8 !important;
  border-left: 5px solid #1D4ED8 !important;
  font-weight: 800; font-size: 11pt; color: white;
  background: linear-gradient(135deg, #1D4ED8, #2563EB) !important;
  border-radius: 4px;
}

/* Status */
.status-line {
  margin-top: 12px; font-size: 9pt; color: #475569;
  display: flex; align-items: center; gap: 8px;
}
.status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 14px; border-radius: 20px;
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
  background: #EFF6FF; border-left: 4px solid #2563EB;
  border-radius: 0 6px 6px 0; display: flex; align-items: center;
}
.list { margin: 0; padding-left: 22px; font-size: 9pt; line-height: 1.8; color: #475569; }
.list li { margin-bottom: 4px; }
.compact td { padding: 5px 10px; font-size: 8.5pt; }
.italic { font-style: italic; color: #64748b; font-size: 8.5pt; }

/* Footer */
.ftr { margin-top: auto; padding-top: 24px; }
.ftr-line {
  height: 2px;
  background: linear-gradient(90deg, #2563EB, #BFDBFE, transparent);
  margin-bottom: 10px;
}
.ftr-content { display: flex; justify-content: space-between; align-items: center; }
.ftr-text { font-size: 7pt; color: #94a3b8; }
`

const LOGO_SVG = `<svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 14L12 10L16 14L20 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 20H20" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
</svg>`

const TOC_ITEMS = [
  'Neraca Saldo',
  'Laporan Laba Rugi',
  'Laporan Posisi Keuangan',
  'Catatan Atas Laporan Keuangan (CALK)',
]

function coverPage(date, user) {
  const toc = TOC_ITEMS.map((name, i) => `
    <div class="cover-toc-item">
      <span class="cover-toc-num">${i + 1}</span>
      <span class="cover-toc-name">${name}</span>
    </div>`).join('')

  return `
  <div class="page cover">
    <div class="cover-band"></div>
    <div class="cover-top">
      <div class="cover-logo">${LOGO_SVG}</div>
      <div>
        <div class="cover-brand-name">AI UMKM</div>
        <div class="cover-brand-tag">Sistem Akuntansi Cerdas untuk UMKM</div>
      </div>
    </div>
    <div class="cover-center">
      <span class="cover-kicker">Laporan Keuangan</span>
      <h1 class="cover-title">Laporan Keuangan</h1>
      <p class="cover-sub">Disusun sesuai Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM)</p>
      <div class="cover-divider"></div>
    </div>
    <div class="cover-meta">
      <div class="cover-meta-block">
        <span class="cover-meta-label">Perusahaan</span>
        <span class="cover-meta-value">${user?.company_name || 'Nama Perusahaan'}</span>
        ${user?.email ? `<span class="cover-meta-small">${user.email}</span>` : ''}
      </div>
      <div class="cover-meta-block">
        <span class="cover-meta-label">Periode</span>
        <span class="cover-meta-value">Per ${formatTanggalIndo(date)}</span>
      </div>
      <div class="cover-meta-block">
        <span class="cover-meta-label">Dicetak</span>
        <span class="cover-meta-value">${formatTanggalCetak()}</span>
      </div>
    </div>
    <div class="cover-toc">
      <div class="cover-toc-title">Daftar Isi</div>
      ${toc}
    </div>
    <div class="cover-foot">
      <div class="cover-foot-line"></div>
      <span>Dokumen ini dihasilkan secara otomatis oleh AI UMKM</span>
    </div>
  </div>`
}

function header(title, date, user) {
  return `
  <div class="hdr">
    <div class="hdr-top">
      <div class="hdr-left">
        <div class="hdr-logo">${LOGO_SVG}</div>
        <div>
          <h1 class="hdr-company">${user?.company_name || 'Nama Perusahaan'}</h1>
          ${user?.email ? `<p class="hdr-email">${user.email}</p>` : ''}
        </div>
      </div>
      <div class="hdr-badge">AI UMKM</div>
    </div>
    <div class="hdr-divider"></div>
    <div class="hdr-bottom">
      <div>
        <h2 class="hdr-title">${title}</h2>
        <p class="hdr-subtitle">Per ${formatTanggalIndo(date)}</p>
      </div>
      <div class="hdr-meta">
        <span class="hdr-meta-label">Dicetak</span>
        <span class="hdr-meta-value">${formatTanggalCetak()}</span>
      </div>
    </div>
  </div>`
}

function footer() {
  return `
  <div class="ftr">
    <div class="ftr-line"></div>
    <div class="ftr-content">
      <span class="ftr-text">Dibuat oleh AI UMKM - Sistem Akuntansi Cerdas</span>
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

function neracaSaldo(data, date, user) {
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
    ${header('LAPORAN NERACA SALDO', date, user)}
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

function labaRugi(data, date, user) {
  return `
  <div class="page">
    ${header('LAPORAN LABA RUGI', date, user)}
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

function posisiKeuangan(data, date, user) {
  return `
  <div class="page">
    ${header('LAPORAN POSISI KEUANGAN', date, user)}
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

function calk(data, date, user) {
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
    ${header('CATATAN ATAS LAPORAN KEUANGAN (CALK)', date, user)}
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

export function buildReportHtml(tab, data, date, user) {
  const builder = BUILDERS[tab]
  if (!builder || !data) return ''

  return `<style>${CSS}</style>${builder(data, date, user)}`
}

export function buildReportFullHtml(tab, data, date, user) {
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
  ${builder(data, date, user)}
</body>
</html>`
}

export function buildAllReportsFullHtml(allData, date, user) {
  if (!allData) return ''

  const pages = []
  for (const tab of ['neraca-saldo', 'laba-rugi', 'posisi-keuangan', 'calk']) {
    const builder = BUILDERS[tab]
    const data = allData[tab]
    if (builder && data) {
      pages.push(builder(data, date, user))
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
  ${coverPage(date, user)}
  ${pages.join('\n')}
</body>
</html>`
}
