/**
 * SPT Form Generators - Bilingual (ID/EN) HTML generators for DJP official TRF forms
 */

// ========================================================================
// Helpers
// ========================================================================

export function formatAngka(val) {
  if (val === undefined || val === null || val === '' || isNaN(val)) return ''
  const n = Math.round(Number(val))
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
}

export function rp(val) {
  const n = Number(val || 0)
  return formatAngka(n)
}

export function esc(val) {
  if (val === undefined || val === null) return ''
  return String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function checkBox(active) {
  return `<span class="sp-cbx">${active ? 'X' : ''}</span>`
}

export function statusKawinLabel(status) {
  const map = { KK: 'KK', HB: 'HB', PH: 'PH', MT: 'MT' }
  return map[status] || 'KK'
}

export function tanggalCetak() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ========================================================================
// Bilingual Labels
// ========================================================================

const IDS = {
  sectionA: 'A. PENGHASILAN NETO',
  sectionB: 'B. PENGHASILAN KENA PAJAK',
  sectionC: 'C. PPh TERUTANG',
  sectionD: 'D. KREDIT PAJAK',
  sectionE: 'E. PPh KURANG/LEBIH BAYAR',
  sectionF: 'F. ANGSURAN PPh PASAL 25',
  sectionG: 'G. LAMPIRAN',
}

const EN = {
  sectionA: 'A. NET INCOME',
  sectionB: 'B. TAXABLE INCOME',
  sectionC: 'C. TAX PAYABLE',
  sectionD: 'D. TAX CREDIT',
  sectionE: 'E. TAX UNDER/OVERPAYMENT',
  sectionF: 'F. PPh ARTICLE 25 INSTALLMENTS',
  sectionG: 'G. ATTACHMENTS',
}

function lbl(id, enId, lang) {
  if (lang === 'en') return enId
  if (lang === 'id') return id
  return `${id}<br><span class="sp-en">${enId}</span>`
}

// ========================================================================
// CSS Definitions
// ========================================================================

export const INDUK1770_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: white; }
body { font-family: 'Times New Roman', Times, Georgia, serif; color: #000; font-size: 9pt; line-height: 1.25; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@page { size: 216mm 330mm; margin: 8mm 8mm; }

/* ---- Page containers ---- */
.sp-page { width: 100%; min-height: 314mm; page-break-after: always; padding: 0; position: relative; display: flex; flex-direction: column; }
.sp-body { flex: 1; display: flex; flex-direction: column; }
.sp-body > .sp-pernyataan { margin-top: auto; }

/* ---- Corner markers ---- */
.sp-corner { position: absolute; width: 3.5mm; height: 3.5mm; background: #000; z-index: 1; }
.sp-corner-tl { top: 0; left: 0; }
.sp-corner-tr { top: 0; right: 0; }
.sp-corner-bl { bottom: 0; left: 0; }
.sp-corner-br { bottom: 0; right: 0; }

/* ---- Utility ---- */
.sp-center { text-align: center; }
.sp-bold { font-weight: bold; }
.sp-sm { font-size: 8pt; }
.sp-xs { font-size: 7pt; }
.sp-right { text-align: right; white-space: nowrap; }
.sp-mono { font-family: 'Courier New', monospace; }
.sp-num { text-align: center; white-space: nowrap; }
.sp-cbx { display: inline-block; width: 10px; height: 10px; border: 1px solid #000; text-align: center; font-size: 8px; line-height: 8px; font-weight: bold; vertical-align: middle; }
.sp-kotak { border: 1px solid #000; display: inline-block; padding: 0 4px; }

/* ---- Header ---- */
.sp-hdr { border: 1.5px solid #000; margin-bottom: 2mm; }
.sp-hdr-top { display: flex; justify-content: space-between; align-items: stretch; border-bottom: 1.5px solid #000; }
.sp-hdr-code { width: 22%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-size: 13pt; font-weight: bold; padding: 2px; }
.sp-hdr-title { flex: 1; text-align: center; padding: 2px 6px; }
.sp-hdr-tp { width: 22%; border-left: 1.5px solid #000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2px; font-size: 7.5pt; }
.sp-tp-boxes { display: flex; gap: 2px; margin-top: 2px; }
.sp-tp-box { width: 14px; height: 15px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 9pt; font-weight: bold; }

/* ---- Identity table ---- */
.sp-id-table { width: 100%; border-collapse: collapse; }
.sp-id-table td { border: 1px solid #000; padding: 1px 5px; vertical-align: middle; }
.sp-id-lbl { font-weight: bold; white-space: nowrap; padding-right: 4px; }
.sp-id-val { border-bottom: 1px solid #000; min-width: 60px; padding: 0 4px; display: inline-block; }
.sp-note-banner { border: 1px solid #000; border-top: none; font-size: 6.5pt; text-align: center; padding: 3px 6px; line-height: 1.4; }

/* ---- Main data table ---- */
.sp-table { width: 100%; border-collapse: collapse; margin-top: 3mm; }
.sp-table th, .sp-table td { border: 1px solid #000; padding: 2px 4px; vertical-align: top; }
.sp-table th { background: #fff; text-align: center; font-weight: bold; font-size: 8pt; }
.sp-sec th { text-align: left; font-size: 8pt; padding: 2px 6px; background: #d9d9d9; font-weight: bold; }
.sp-grandrow td { background: #eaeaea; font-weight: bold; }
.sp-subrow td { font-size: 8pt; padding-left: 14px; }
.sp-row-lbl { text-align: left; }
.sp-cell-val { text-align: right; font-family: 'Courier New', monospace; white-space: nowrap; width: 24%; }
.sp-induk { font-size: 7pt; margin-top: 1mm; }
.sp-induk td { padding: 1px 4px; }
.sp-induk th { padding: 1px 4px; font-size: 7pt; }

/* ---- Statement / Pernyataan ---- */
.sp-pernyataan { border: 1px solid #000; margin-top: 3mm; font-size: 7pt; }
.sp-pernyataan .sp-title2 { font-weight: bold; text-align: center; padding: 2px; border-bottom: 1px solid #000; }
.sp-pernyataan p { padding: 2px 8px; text-align: justify; line-height: 1.35; }
.sp-sign-row { display: flex; }
.sp-sign-row > div { flex: 1; border: 1px solid #000; border-top: none; padding: 2px 8px; }
.sp-sign-name { margin-top: 2mm; border-bottom: 1px solid #000; text-align: center; padding-bottom: 1px; font-weight: bold; }
.sp-sign-space { height: 15mm; }

/* ---- Footer ---- */
.sp-foot { font-size: 6.5pt; color: #333; border: 1px solid #000; border-top: none; padding: 2px 5px; margin-top: 0; }

/* ---- GI Page ---- */
.sp-gi-page { width: 100%; min-height: 314mm; page-break-after: always; padding: 0; position: relative; display: flex; flex-direction: column; }
.sp-gi-body { padding: 0 4mm; font-size: 7.5pt; line-height: 1.45; flex: 1; }
.sp-gi-hdr { border: 1.5px solid #000; margin-bottom: 3mm; }
.sp-gi-hdr-top { display: flex; justify-content: space-between; align-items: stretch; border-bottom: 1.5px solid #000; }
.sp-gi-hdr-label { width: 22%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-size: 9pt; font-weight: bold; padding: 2px; }
.sp-gi-hdr-title { flex: 1; text-align: center; padding: 3px 8px; }
.sp-gi-hdr-tp { width: 22%; border-left: 1.5px solid #000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2px; font-size: 7.5pt; }
.sp-gi-sub { border: 1px solid #000; border-top: none; padding: 4px 8px; font-size: 7.5pt; text-align: center; font-weight: bold; line-height: 1.4; }
.sp-gi-section { font-weight: bold; font-size: 8.5pt; text-align: center; margin: 4mm 0 2mm 0; padding: 2px; border: 1px solid #000; background: #d9d9d9; }
.sp-gi-item { margin-bottom: 5mm; text-align: justify; }
.sp-gi-item b { font-size: 7.5pt; }
.sp-gi-note { border: 1px solid #000; padding: 3px 6px; margin: 3mm 0; font-size: 7pt; background: #f5f5f5; line-height: 1.35; }
.sp-gi-example { border: 1px solid #000; padding: 3px 6px; margin: 2mm 0; font-size: 7pt; }
.sp-gi-example-title { font-weight: bold; font-size: 7.5pt; margin-bottom: 1mm; }
.sp-gi-table { width: 100%; border-collapse: collapse; margin: 1mm 0; }
.sp-gi-table td, .sp-gi-table th { border: 1px solid #000; padding: 1px 4px; font-size: 7pt; text-align: center; }
.sp-gi-table th { background: #e8e8e8; font-weight: bold; }
.sp-gi-cbx-row { margin: 1mm 0; font-size: 7pt; }
.sp-gi-status-row { display: flex; gap: 6px; margin: 1mm 0; font-size: 7pt; }
.sp-gi-cb-item { display: inline-flex; align-items: center; gap: 2px; }

/* ---- Lampiran ---- */
.sp-lamp-title { border: 1.5px solid #000; margin-bottom: 3mm; }
.sp-lamp-title-top { display: flex; justify-content: space-between; align-items: stretch; border-bottom: 1.5px solid #000; }
.sp-lamp-title-code { width: 22%; border-right: 1.5px solid #000; display: flex; align-items: center; justify-content: center; font-size: 11pt; font-weight: bold; padding: 2px; }
.sp-lamp-title-text { flex: 1; text-align: center; padding: 2px 6px; }
.sp-lamp-title-tp { width: 22%; border-left: 1.5px solid #000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2px; font-size: 7.5pt; }
.sp-lamp-sec th { text-align: left; font-size: 8pt; padding: 2px 6px; background: #d9d9d9; font-weight: bold; }
.sp-lamp-table { width: 100%; border-collapse: collapse; margin-top: 2mm; }
.sp-lamp-table th, .sp-lamp-table td { border: 1px solid #000; padding: 2px 4px; vertical-align: top; }
.sp-lamp-table th { text-align: center; font-weight: bold; font-size: 7.5pt; }
.sp-lamp-table td { font-size: 8pt; }
.sp-lamp-table .sp-cell-val { width: 20%; }
.sp-sub-label { padding-left: 14px !important; font-size: 7.5pt; }
.sp-legend { font-size: 7pt; margin-top: 2mm; }
.sp-lampiran-check td { font-size: 6pt; padding: 1px 3px; }
.sp-note { font-size: 6.8pt; margin-top: 1mm; }
.sp-en { display: block; font-weight: normal; font-size: 6.5pt; color: #333; }

@media print { @page { size: 216mm 330mm; margin: 8mm; } body { font-family: 'Times New Roman', Times, serif; } }
`

export const PREVIEW_CSS = `
.sp-preview-container { overflow: auto; padding: 16px; background: #f5f5f5; max-height: calc(100vh - 200px); }
.sp-pages-container { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.sp-preview-page { width: 216mm; min-height: 330mm; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 8mm; position: relative; display: flex; flex-direction: column; }
.sp-preview-page:last-child { page-break-after: auto; }
@media print { .sp-preview-page { page-break-after: always; margin: 0; box-shadow: none; padding: 0; } }
.toolbar { position: sticky; top: 0; z-index: 10; background: #f8fafc; padding: 8px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.toolbar select, .toolbar button { padding: 6px 12px; font-size: 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
.toolbar button { background: #3b82f6; color: white; border-color: #3b82f6; }
.toolbar button:hover { background: #2563eb; }
@media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } }
`

// ========================================================================
// Header Functions
// ========================================================================

function headerForm({ code, title, titleEn, tahunPajak, npwp, nama, pembetulan, extra }, lang) {
  const tp = String(tahunPajak || '')
  const tpBoxes = (tp ? tp.padStart(4, '0').split('') : ['_', '_', '_', '_']).slice(-4).map(c => `<span class="sp-tp-box">${c === '_' ? '&nbsp;' : c}</span>`).join('')
  const mainTitle = lbl('SPT TAHUNAN PPh WAJIB PAJAK ORANG PRIBADI', 'ANNUAL TAX RETURN PPh INDIVIDUAL TAXPAYER', lang)
  
  return `<div class="sp-hdr">
    <div class="sp-hdr-top">
      <div class="sp-hdr-code">${esc(code)}</div>
      <div class="sp-hdr-title">
        <div class="sp-sm">KEMENTERIAN KEUANGAN RI / MINISTRY OF FINANCE</div>
        <div class="sp-sm">DIREKTORAT JENDERAL PAJAK / DIRECTORATE GENERAL OF TAXES</div>
        <div class="sp-bold" style="font-size:11pt; letter-spacing:0.3px;">${mainTitle}</div>
        <div class="sp-sm">${esc(title || '')}</div>
      </div>
      <div class="sp-hdr-tp">
        <div>TAHUN PAJAK / TAX YEAR</div>
        <div class="sp-tp-boxes">${tpBoxes}</div>
      </div>
    </div>
    <table class="sp-id-table">
      <tr>
        <td class="sp-id-lbl" style="width:22%">NPWP</td>
        <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:90px">${esc(npwp)}</span></td>
        <td class="sp-id-lbl" style="width:28%">NAMA WAJIB PAJAK / TAXPAYER NAME</td>
        <td class="sp-sm"><span class="sp-id-val" style="min-width:110px">${esc(nama)}</span></td>
      </tr>
      ${extra || ''}
    </table>
    <div class="sp-note-banner">
      PERHATIAN : SEBELUM MENGISI BACALAH PETUNJUK PENGISIAN. ISI DENGAN HURUF CETAK / DIKETIK DENGAN TINTA HITAM.
      BERI TANDA "&quot;X&quot;" DALAM <span class="sp-cbx"></span> YANG SESUAI.
      ${pembetulan ? ` SPT PEMBETULAN KE - <span class="sp-kotak sp-bold">${esc(pembetulan)}</span>` : ''}
    </div>
  </div>`
}

function identitas1770(ind, lang) {
  const pembetulan = ind.pembetulan_ke || 0
  return `<tr>
    <td class="sp-id-lbl" style="width:22%">PERMOHONAN SPT / TAX RETURN FILING</td>
    <td colspan="3" class="sp-sm">${checkBox(pembetulan === 0)} NORMAL &nbsp;&nbsp; ${checkBox(pembetulan > 0)} SPT PEMBETULAN KE-${pembetulan > 0 ? `<span class="sp-kotak sp-bold">${esc(String(pembetulan))}</span>` : '<span class="sp-kotak">&nbsp;</span>'}</td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:22%">JENIS USAHA/PEKERJAAN BEBAS / TYPE OF BUSINESS</td>
    <td class="sp-sm" style="width:28%"><span class="sp-id-val">${esc(ind.jenis_usaha)}</span></td>
    <td class="sp-id-lbl" style="width:28%">NO. TELEPON/FAKSIMILI</td>
    <td class="sp-sm"><span class="sp-id-val">${esc(ind.no_telepon)}</span> / <span class="sp-id-val">${esc(ind.no_faks)}</span></td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:22%">KLU</td>
    <td class="sp-sm" style="width:28%"><span class="sp-id-val">${esc(ind.klu)}</span></td>
    <td class="sp-id-lbl" style="width:28%">STATUS KEWAJIBAN PERPAJAKAN SUAMI-ISTERI</td>
    <td class="sp-sm">${checkBox(ind.status_kawin === 'KK')} KK &nbsp; ${checkBox(ind.status_kawin === 'HB')} HB &nbsp; ${checkBox(ind.status_kawin === 'PH')} PH &nbsp; ${checkBox(ind.status_kawin === 'MT')} MT</td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:22%">NPWP ISTERI/SUAMI</td>
    <td class="sp-sm" style="width:28%"><span class="sp-id-val">${esc(ind.npwp_pasangan)}</span></td>
    <td class="sp-id-lbl" style="width:28%">ALAMAT</td>
    <td class="sp-sm"><span class="sp-id-val">${esc(ind.alamat)}</span></td>
  </tr>`
}

function identitas1770S(ind, lang) {
  const pembetulan = ind.pembetulan_ke || 0
  return `<tr>
    <td class="sp-id-lbl" style="width:22%">PERMOHONAN SPT / TAX RETURN FILING</td>
    <td colspan="3" class="sp-sm">${checkBox(pembetulan === 0)} NORMAL &nbsp;&nbsp; ${checkBox(pembetulan > 0)} SPT PEMBETULAN KE-${pembetulan > 0 ? `<span class="sp-kotak sp-bold">${esc(String(pembetulan))}</span>` : '<span class="sp-kotak">&nbsp;</span>'}</td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:22%">PEKERJAAN / OCCUPATION</td>
    <td class="sp-sm" style="width:28%"><span class="sp-id-val">${esc(ind.pekerjaan_utama)}</span></td>
    <td class="sp-id-lbl" style="width:28%">NO. TELEPON</td>
    <td class="sp-sm"><span class="sp-id-val">${esc(ind.no_telepon)}</span></td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:22%">KLU</td>
    <td class="sp-sm" style="width:28%"><span class="sp-id-val">${esc(ind.klu)}</span></td>
    <td class="sp-id-lbl" style="width:28%">NO. FAKSIMILI</td>
    <td class="sp-sm"><span class="sp-id-val">${esc(ind.no_faks)}</span></td>
  </tr><tr>
    <td class="sp-id-lbl" style="width:28%">STATUS KEWAJIBAN PERPAJAKAN SUAMI-ISTERI</td>
    <td class="sp-sm">${checkBox(ind.status_kawin === 'KK')} KK &nbsp; ${checkBox(ind.status_kawin === 'HB')} HB &nbsp; ${checkBox(ind.status_kawin === 'PH')} PH &nbsp; ${checkBox(ind.status_kawin === 'MT')} MT</td>
    <td class="sp-id-lbl" style="width:28%">NPWP ISTERI/SUAMI</td>
    <td class="sp-sm"><span class="sp-id-val">${esc(ind.npwp_pasangan)}</span></td>
  </tr>`
}

function secHeader(labelId, enLabel, lang) {
  return `<tr class="sp-sec"><th colspan="3">${lbl(labelId, enLabel, lang)}</th></tr>`
}

function rowNum(num, label, val, opts = {}, lang) {
  const cls = opts.grand ? ' class="sp-grandrow"' : ''
  const labelText = typeof label === 'string' ? lbl(label, '', lang) : label
  return `<tr${cls}><td class="sp-num" style="width:8%">${esc(num)}</td><td class="sp-row-lbl">${labelText}</td><td class="sp-cell-val">${rp(val)}</td></tr>`
}

function rowAB(num, items, lang) {
  return items.map((it, i) => `<tr${it.bold ? ' class="sp-grandrow"' : ''}>
    <td class="sp-num" style="width:8%">${i === 0 ? esc(num) : ''}</td>
    <td class="sp-row-lbl${i === 0 ? '' : ' sp-sub-label'}">${esc(it.label)}</td>
    <td class="sp-cell-val">${rp(it.val)}</td>
  </tr>`).join('')
}

function footForm(lang) {
  const dateStr = tanggalCetak()
  return `<div class="sp-foot">Dokumen ini dibuat sebagai alat bantu isian SPT Tahunan dan bukan pengganti e-Form/e-Filing resmi DJP.<br>
Dicetak: ${dateStr}.</div>`
}

function cornerMarkers() {
  return `<div class="sp-corner sp-corner-tl"></div><div class="sp-corner sp-corner-tr"></div><div class="sp-corner sp-corner-bl"></div><div class="sp-corner sp-corner-br"></div>`
}

function pernyataan(nama, lang) {
  return `<div class="sp-pernyataan">
    <div class="sp-title2">${lbl('PERNYATAAN', 'STATEMENT', lang)}</div>
    <p>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas.</p>
    <div class="sp-sign-row">
      <div><div class="sp-xs sp-bold">TANGGAL :</div><div class="sp-xs">TANDA TANGAN</div><div class="sp-sign-space">&nbsp;</div><div class="sp-xs">NAMA LENGKAP / FULL NAME</div><div class="sp-sign-name">${esc(nama)}</div><div class="sp-xs sp-center sp-bold">WAJIB PAJAK / TAXPAYER</div></div>
      <div><div class="sp-xs sp-bold">TANGGAL :</div><div class="sp-xs">TANDA TANGAN</div><div class="sp-sign-space">&nbsp;</div><div class="sp-xs">NAMA LENGKAP / FULL NAME</div><div class="sp-sign-name">&nbsp;</div><div class="sp-xs sp-center sp-bold">KUASA / PROXY</div></div>
    </div>
  </div>`
}

// ========================================================================
// Form Induk 1770
// ========================================================================

export function INDUK1770(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const permohonan = data?.permohonan || {}
  const rest = permohonan.restitusi || ''
  const st = statusKawinLabel(ind.status_kawin)
  
  const rows = [
    secHeader(IDS.sectionA, EN.sectionA, lang),
    rowNum('1.', 'PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS', calc.angka_1, {}, lang),
    rowNum('2.', 'PENGHASILAN NETO DALAM NEGERI SEHUBUNGAN DENGAN PEKERJAAN', calc.angka_2, {}, lang),
    rowNum('3.', 'PENGHASILAN NETO DALAM NEGERI LAINNYA', calc.angka_3, {}, lang),
    rowNum('4.', 'PENGHASILAN NETO LUAR NEGERI', calc.angka_4, {}, lang),
    rowNum('5.', 'JUMLAH PENGHASILAN NETO (1 + 2 + 3 + 4)', calc.angka_5, { grand: true }, lang),
    rowNum('6.', 'ZAKAT / SUMBANGAN KEAGAMAAN YANG BERSIFAT WAJIB', calc.angka_6),
    rowNum('7.', 'JUMLAH PENGHASILAN NETO SETELAH PENGURANGAN ZAKAT/SUMBANGAN KEAGAMAAN YANG SIFATNYA WAJIB (5 - 6)', calc.angka_7, { grand: true }, lang),
    secHeader(IDS.sectionB, EN.sectionB, lang),
    rowNum('8.', 'KOMPENSASI KERUGIAN', calc.angka_8),
    rowNum('9.', 'JUMLAH PENGHASILAN NETO SETELAH KOMPENSASI KERUGIAN (7 - 8)', calc.angka_9, { grand: true }, lang),
    rowNum('10.', 'PENGHASILAN TIDAK KENA PAJAK (PTKP)', calc.angka_10),
    rowNum('11.', 'PENGHASILAN KENA PAJAK (9 - 10)', calc.angka_11, { grand: true }, lang),
    secHeader(IDS.sectionC, EN.sectionC, lang),
    rowNum('12.', 'PPh TERUTANG (TARIF PASAL 17)', calc.angka_12),
    rowNum('13.', 'PENGEMBALIAN/PENGURANGAN PPh PASAL 24', calc.pengembalian_pph_24),
    rowNum('14.', 'JUMLAH PPh TERUTANG (12 + 13)', calc.jumlah_pph_terutang, { grand: true }, lang),
    secHeader(IDS.sectionD, EN.sectionD, lang),
    rowNum('15.', 'PPh YANG DIPOTONG / DIPUNGUT OLEH PIHAK LAIN', calc.angka_15),
    rowAB('16.', [{ label: 'a. PPh YANG HARUS DIBAYAR SENDIRI', val: calc.angka_16, bold: true }, { label: 'b. PPh YANG LEBIH DIPOTONG/DIPUNGUT', val: calc.pph_lebih_dipotong }], lang),
    secHeader(IDS.sectionE, EN.sectionE, lang),
    rowAB('17.', [{ label: 'a. PPh PASAL 25 BULANAN', val: calc.angka_17 }, { label: 'b. STP PPh PASAL 25', val: calc.stp_pph_25 }], lang),
    rowNum('18.', 'JUMLAH KREDIT PAJAK (17a + 17b)', calc.jumlah_kredit_pph_25, { grand: true }, lang),
    rowAB('19.', [{ label: 'a. PPh YANG KURANG DIBAYAR (Pasal 29)', val: calc.angka_19a, bold: true }, { label: 'b. PPh YANG LEBIH DIBAYAR (Pasal 28A)', val: calc.angka_19b, bold: true }], lang),
    `<tr><td class="sp-num" style="width:8%">20.</td><td class="sp-row-lbl">PERMOHONAN : PPh Lebih Bayar pada 19.b mohon ${checkBox(rest === 'DIRESTITUSIKAN')} DIKEMBALIKAN (RESTITUSI) &nbsp;&nbsp; ${checkBox(rest === 'KOMPENSASI')} DIPERHITUNGKAN (KOMPENSASI)</td><td class="sp-cell-val"></td></tr>`,
    secHeader(IDS.sectionF, EN.sectionF, lang),
    `<tr class="sp-grandrow"><td class="sp-num" style="width:8%">21.</td><td class="sp-row-lbl">ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA<br><span class="sp-xs">a. 1/12 x JUMLAH PADA ANGKA 16 &nbsp;&nbsp; ${checkBox(true)}</span><br><span class="sp-xs">b. PERHITUNGAN WAJIB PAJAK ORANG PRIBADI PENGUSAHA TERTENTU &nbsp;&nbsp; ${checkBox(false)}</span><br><span class="sp-xs">c. PERHITUNGAN DALAM LAMPIRAN TERSENDIRI &nbsp;&nbsp; ${checkBox(false)}</span></td><td class="sp-cell-val">${rp(calc.angka_21)}</td></tr>`,
    secHeader(IDS.sectionG, EN.sectionG, lang),
    `<tr class="sp-lampiran-check"><td colspan="3"><span class="sp-bold">SELAIN FORMULIR 1770-I SAMPAI DENGAN 1770-IV HARUS DILAMPIRKAN PULA:</span><br>a. SURAT KUASA KHUSUS ${checkBox(false)} &nbsp; b. SSP LEMBAR KE-3 PPh PASAL 29 ${checkBox(calc.angka_19a > 0)} &nbsp; c. PERHITUNGAN KOMPENSASI KERUGIAN FISKAL ${checkBox(calc.angka_8 > 0)} &nbsp; d. FOTOKOPI FORMULIR 1721-A1/A2 ${checkBox(false)}<br>e. PERHITUNGAN ANGSURAN PPh PASAL 25 ${checkBox(false)} &nbsp; f. PERHITUNGAN PPh TERUTANG (WP PH/MT) ${checkBox(st === 'PH' || st === 'MT')} &nbsp; g-h-i ...</td></tr>`,
  ]
  
  return `<div class="sp-page">${cornerMarkers()}${headerForm({ code: '1770', title: 'UNTUK WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN DARI USAHA/PEKERJAAN BEBAS', tahunPajak: ind.tahun_pajak, npwp: ind.npwp, nama: ind.nama, pembetulan: ind.pembetulan_ke, extra: identitas1770(ind, lang) })}
    <div class="sp-body">
      <table class="sp-table sp-induk"><thead><tr><th style="width:8%">NO.</th><th>URAIAN / DESCRIPTION</th><th style="width:24%">JUMLAH (Rupiah) / TOTAL (Rupiah)</th></tr></thead><tbody>${rows.join('')}</tbody></table>
      ${pernyataan(ind.nama, lang)}
    </div>
    ${footForm(lang)}
  </div>`
}

// ========================================================================
// Form Induk 1770S
// ========================================================================

export function INDUK1770S(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const permohonan = data?.permohonan || {}
  const rest = permohonan.restitusi || ''
  const st = statusKawinLabel(ind.status_kawin)
  
  const rows = [
    secHeader(IDS.sectionA, EN.sectionA, lang),
    rowNum('1.', 'PENGHASILAN NETO DARI PEKERJAAN', calc.angka_2),
    rowNum('2.', 'PENGHASILAN NETO DALAM NEGERI LAINNYA', calc.angka_3),
    rowNum('3.', 'PENGHASILAN NETO LUAR NEGERI', calc.angka_4),
    rowNum('4.', 'JUMLAH PENGHASILAN NETO (1 + 2 + 3)', calc.angka_5, { grand: true }, lang),
    rowNum('5.', 'ZAKAT / SUMBANGAN KEAGAMAAN YANG SIFATNYA WAJIB', calc.angka_6),
    rowNum('6.', 'JUMLAH PENGHASILAN NETO SETELAH PENGURANGAN ZAKAT (4 - 5)', calc.angka_7, { grand: true }, lang),
    secHeader(IDS.sectionB, EN.sectionB, lang),
    rowNum('7.', 'PENGHASILAN TIDAK KENA PAJAK (PTKP)', calc.angka_10),
    rowNum('8.', 'PENGHASILAN KENA PAJAK (6 - 7)', calc.angka_11, { grand: true }, lang),
    secHeader(IDS.sectionC, EN.sectionC, lang),
    rowNum('9.', 'PPh TERUTANG (TARIF PASAL 17 × PKP)', calc.angka_12),
    rowNum('10.', 'PENGEMBALIAN / PENGURANGAN PPh PASAL 24', calc.pengembalian_pph_24),
    rowNum('11.', 'JUMLAH PPh TERUTANG (9 + 10)', calc.jumlah_pph_terutang, { grand: true }, lang),
    secHeader(IDS.sectionD, EN.sectionD, lang),
    rowNum('12.', 'PPh YANG DIPOTONG / DIPUNGUT OLEH PIHAK LAIN', calc.angka_15),
    rowAB('13.', [{ label: 'a. PPh YANG HARUS DIBAYAR SENDIRI', val: calc.angka_16, bold: true }, { label: 'b. PPh YANG LEBIH DIPOTONG/DIPUNGUT', val: calc.pph_lebih_dipotong }], lang),
    rowAB('14.', [{ label: 'a. PPh PASAL 25', val: calc.angka_17 }, { label: 'b. STP PPh PASAL 25', val: calc.stp_pph_25 }], lang),
    rowNum('15.', 'JUMLAH KREDIT PAJAK (14a + 14b)', calc.jumlah_kredit_pph_25, { grand: true }, lang),
    rowAB('16.', [{ label: 'a. PPh YANG KURANG DIBAYAR (Pasal 29)', val: calc.angka_19a, bold: true }, { label: 'b. PPh YANG LEBIH DIBAYAR (Pasal 28A)', val: calc.angka_19b, bold: true }], lang),
    `<tr><td class="sp-num" style="width:8%">17.</td><td class="sp-row-lbl">PERMOHONAN : PPh Lebih Bayar pada 16.b mohon ${checkBox(rest === 'DIRESTITUSIKAN')} DIRESTITUSIKAN &nbsp;&nbsp; ${checkBox(rest === 'KOMPENSASI')} DIPERHITUNGKAN DENGAN UTANG PAJAK</td><td class="sp-cell-val"></td></tr>`,
    secHeader('F. ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA', '', lang),
    `<tr class="sp-grandrow"><td class="sp-num" style="width:8%">18.</td><td class="sp-row-lbl">ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA<br><span class="sp-xs">a. 1/12 x JUMLAH PADA ANGKA 13 &nbsp;&nbsp; ${checkBox(true)}</span><br><span class="sp-xs">b. PERHITUNGAN DALAM LAMPIRAN TERSENDIRI &nbsp;&nbsp; ${checkBox(false)}</span></td><td class="sp-cell-val">${rp(calc.angka_21)}</td></tr>`,
    secHeader(IDS.sectionG, EN.sectionG, lang),
    `<tr class="sp-lampiran-check"><td colspan="3"><div style="margin-top:1px">a. FOTOKOPI FORMULIR 1721-A1/A2 ATAU BUKTI POTONG PASAL 21 ${checkBox(true)} &nbsp; b. SSP LEMBAR KE-3 PPh PASAL 29 ${checkBox((calc.angka_19a || 0) > 0)} &nbsp; c. SURAT KUASA KHUSUS ${checkBox(false)}</div></td></tr>`,
  ]
  
  return `<div class="sp-page">${cornerMarkers()}${headerForm({ code: '1770 S', title: 'UNTUK WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN: DARI SATU ATAU LEBIH PEMBERI KERJA', tahunPajak: ind.tahun_pajak, npwp: ind.npwp, nama: ind.nama, pembetulan: ind.pembetulan_ke, extra: identitas1770S(ind, lang) })}
    <div class="sp-body">
      <table class="sp-table sp-induk"><thead><tr><th style="width:8%">NO.</th><th>URAIAN / DESCRIPTION</th><th style="width:24%">JUMLAH (Rupiah) / TOTAL (Rupiah)</th></tr></thead><tbody>${rows.join('')}</tbody></table>
      ${pernyataan(ind.nama, lang)}
    </div>
    ${footForm(lang)}
  </div>`
}

// ========================================================================
// General Instructions Helpers
// ========================================================================

function giHeader(code, titleId, titleEn, subtitle, lang) {
  return `<div class="sp-gi-hdr">
    <div class="sp-gi-hdr-top">
      <div class="sp-gi-hdr-label">${esc(code)}</div>
      <div class="sp-gi-hdr-title">
        <div class="sp-sm">KEMENTERIAN KEUANGAN RI / MINISTRY OF FINANCE</div>
        <div class="sp-sm">DIREKTORAT JENDERAL PAJAK / DIRECTORATE GENERAL OF TAXES</div>
        <div class="sp-bold" style="font-size:10pt;">${lbl(titleId, titleEn, lang)}</div>
      </div>
    </div>
    <div class="sp-gi-sub">${esc(subtitle)}</div>
  </div>`
}

// ========================================================================
// General Instructions - Formulir 1770S
// ========================================================================

export function generalInstructions1770S(lang = "bilingual") {
  const giSubtitle = lbl(
    "BAGI WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN: DARI SATU ATAU LEBIH PEMBERI KERJA; DALAM NEGERI LAINNYA; DAN/ATAU YANG DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL.",
    "FOR TAXPAYER WHO HAVE INCOME: FROM ONE OR MORE EMPLOYERS; OTHER DOMESTIC INCOME; AND/OR SUBJECTED TO FINAL AND/OR FINALIZED TAX.",
    lang
  )

  return `<div class="sp-gi-page">${cornerMarkers()}${giHeader("1770 S", "PETUNJUK UMUM / GENERAL INSTRUCTIONS", "", giSubtitle, lang)}
    <div class="sp-gi-body">

      <div class="sp-gi-item"><b>1.</b> ${lbl(
        "Formulir ini telah sesuai dengan ketentuan Peraturan Direktur Jenderal Pajak Nomor PER-34/PJ/2010 tentang Surat Pemberitahuan Tahunan Pajak Penghasilan Wajib Pajak Orang Pribadi dan Wajib Pajak Badan beserta Petunjuk Pengisian sebagaimana telah diubah dengan Peraturan Direktur Jenderal Pajak Nomor PER-36/PJ/2015. Formulir ini digunakan untuk penyampaian SPT Tahunan PPh Orang Pribadi untuk Tahun Pajak 2014 dan seterusnya.",
        "This form is in compliance with the regulations of the Director General of Taxes Number PER-34/PJ/2010 about Income Tax Annual Return Form and General Instructions as amended by regulation the Director General of Taxes Number PER-36/PJ/2015. This form is used for completion of income tax annual tax return for Taxable Year 2014 and onwards.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>2.</b> ${lbl(
        "Cetak formulir ini dengan skala 98% (tidak dicetak dalam mode \"fit size\" atau \"shrink size\"). Hasil cetak harus ditandatangani dan tidak boleh dilipat atau dikusut. Gunakan kertas ukuran: a. F4/Folio/US Folio/Government Legal (8,5 x 13 inci); b. Berat minimal 70 gram.",
        "Print this form in 98% scale (not printed in mode \"fit size\" or \"shrink size\"). This printing results must be signed and must not be folded or crumpled. Use HVS paper size: a. F4/Folio/US Folio/Government Legal (8.5 x 13 inch); b. Minimum weight 70 gr.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>3.</b> ${lbl(
        "Untuk dapat menggunakan formulir ini secara optimal, gunakan aplikasi Adobe Reader versi 8 atau yang lebih baru.",
        "To be able to use this form optimally, use the application Adobe Reader version 8 or newer.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>4.</b> ${lbl(
        "Isi Tahun Pajak, identitas Wajib Pajak dan keterangan lain yang wajib diisi dengan benar. Wajib Pajak dapat menghubungi Kantor Pajak tempat Wajib Pajak terdaftar untuk memastikan Nomor Pokok Wajib Pajak (NPWP) atau melalui aplikasi di situs www.pajak.go.id. Keterangan status kawin perpajakan suami-isteri adalah sebagai berikut:",
        "Complete the Taxable Year, the identity of the Taxpayer and the other mandatory information properly. Taxpayers can contact the tax office where the Taxpayer is registered to ensure their Taxpayer Identification Number (TIN) or through applications on the site www.pajak.go.id. Description of status of married individual are as follows:",
        lang
      )}</div>

      <div class="sp-gi-note" style="margin-left:8mm;">
        ${lbl("<b>KK</b> : Kewajiban Pajak Gabungan - Suami-isteri yang tidak menghendaki untuk melaksanakan hak dan memenuhi kewajiban perpajakan secara terpisah.", "<b>KK</b> : Joint Tax Obligation - Tax rights and obligations undertaken by the head of the family.", lang)}<br>
        ${lbl("<b>HB</b> : Hidup Berpisah - Suami-isteri telah hidup berpisah berdasarkan putusan hakim.", "<b>HB</b> : Spouse have lived separated based on a court decision.", lang)}<br>
        ${lbl("<b>PH</b> : Pisah Harta &amp; Penghasilan - Dikehendaki secara tertulis oleh suami-isteri berdasarkan perjanjian pemisahan harta dan penghasilan.", "<b>PH</b> : It is requested in writing by both the husband and wife on the basis of an agreement for the separation of property and income.", lang)}<br>
        ${lbl("<b>MT</b> : Istri Pilih Kewajiban Terpisah - Dikehendaki oleh isteri yang memilih untuk menjalankan hak dan kewajiban perpajakannya sendiri.", "<b>MT</b> : It is requested by the wife who chooses to meet her tax right and obligation separately.", lang)}
      </div>

      <div class="sp-gi-item"><b>5.</b> ${lbl(
        "Dalam mengisi kolom-kolom yang berisi nilai Rupiah, harus tanpa nilai desimal. Contoh: Sepuluh juta rupiah ditulis 10.000.000 (BUKAN 10.000.000,00). Seratus dua puluh lima rupiah ditulis 125 (BUKAN 125,50).",
        "In filling in columns that contain Rupiah values, must be without decimal values. Example: Ten million rupiah is written 10,000,000 (NOT 10,000,000.00). One hundred twenty-five rupiah is written 125 (NOT 125.50).",
        lang
      )}</div>

      <div class="sp-gi-item"><b>6.</b> ${lbl(
        "Jika Wajib Pajak membuat sendiri formulir SPT Tahunan PPh Orang Pribadi, jangan lupa untuk membuat &#9632; (segi empat hitam) di keempat sudut sebagai pembatas dokumen agar dokumen dapat dipindai.",
        "If the Taxpayer creates the Individual Annual Income Tax Return form, do not forget to create &#9632; (black squares) at the four corners as document boundaries so that the document can be scanned.",
        lang
      )}</div>

      <div class="sp-gi-note">
        ${lbl(
          "Penting: Kertas tidak boleh dilipat atau dikusut. Kolom identitas yang terstruktur (NPWP, KLU, Status Perpajakan Suami-Isteri, Nomor Telepon) isian harus di dalam kotak.",
          "Important: Paper must not be folded or crumpled. Structured identity columns (TIN, KLU, Married Tax Status, Phone Number) must be filled within the boxes.",
          lang
        )}
      </div>

      <div class="sp-gi-item"><b>7.</b> ${lbl(
        "Kode Lapangan Usaha (KLU) diisi sesuai dengan Keputusan Direktur Jenderal Pajak Nomor KEP-233/PJ/2012 tentang Klasifikasi Lapangan Usaha Wajib Pajak sebagaimana telah diubah dengan Keputusan Direktur Jenderal Pajak Nomor KEP-321/PJ/2012.",
        "Business Field Code (KLU) is filled in accordance with Regulation of the Director General of Taxes Number KEP-233/PJ/2012 concerning Taxpayer Business Field Classification as amended by Regulation Number KEP-321/PJ/2012.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>8.</b> ${lbl(
    "Untuk pengisian angka-angka pada Bagian A sampai dengan Bagian E dapat dilihat pada Petunjuk Pengisian SPT Tahunan PPh Wajib Pajak Orang Pribadi.",
    "For filling in the numbers in Part A through Part E, refer to the Instructions for Filling Annual Income Tax Return for Individual Taxpayer.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>9.</b> ${lbl(
    "Bagian A diisi dengan penghasilan neto yang diterima/diperoleh dari satu atau lebih pemberi kerja. Untuk penghasilan neto dari pekerjaan diisi sesuai dengan Angka 4 di Bagian A Lampiran S-I.",
    "Part A is filled with the net income received/obtained from one or more employers. For net income from employment, it is filled according to Number 4 in Part A of Attachment S-I.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>10.</b> ${lbl(
    "Bagian B diisi dengan penghasilan neto dalam negeri lainnya yang diterima/diperoleh selain penghasilan dari pekerjaan, dan/atau penghasilan neto luar negeri.",
    "Part B is filled with other domestic net income received/obtained besides income from employment, and/or foreign net income.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>11.</b> ${lbl(
    "Bagian C diisi dengan PPh terutang berdasarkan Pasal 17 Undang-Undang Pajak Penghasilan. PPh terutang dihitung berdasarkan Penghasilan Kena Pajak dikalikan dengan tarif.",
    "Part C is filled with income tax payable based on Article 17 of the Income Tax Law. Income tax payable is calculated based on Taxable Income multiplied by the rate.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>12.</b> ${lbl(
    "Bagian D diisi dengan pajak penghasilan yang telah dipotong atau dipungut oleh pihak lain (termasuk pemotongan/pemungutan PPh Final) dan pajak penghasilan yang telah dibayar sendiri melalui SSE atau SSP.",
    "Part D is filled with income tax that has been withheld or collected by other parties (including final income tax) and income tax that has been paid by the taxpayer through E-SSP or SSP.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>13.</b> ${lbl(
    "Bagian E diisi dengan jumlah kredit pajak yang terdiri dari pajak penghasilan yang dipotong atau dipungut oleh pihak lain, pajak penghasilan yang dibayar sendiri, dan pengembalian/pengurangan pajak penghasilan pasal 24.",
    "Part E is filled with the total tax credit consisting of income tax withheld or collected by other parties, income tax paid by the taxpayer, and income tax refund/reduction under Article 24.",
        lang
      )}</div>

      <div class="sp-gi-note">
      ${lbl(
    "Jika penghasilan kena pajak nihil atau kurang, kolom pajak penghasilan terutang di Bagian C diisi dengan angka 0 (nol).",
    "If the taxable income is nil or negative, the income tax payable column in Part C is filled with the number 0 (zero).",
        lang
      )}
            </div>

      <div class="sp-gi-item"><b>14.</b> ${lbl(
    "Bagian F diisi dengan angsuran PPh Pasal 25 yang terutang untuk tahun pajak berikutnya. Angsuran PPh Pasal 25 dihitung dengan cara: jumlah PPh yang harus dibayar sendiri dibagi 12 (dua belas).",
    "Part F is filled with PPh Article 25 installments payable for the following tax year. Installments are calculated: total PPh to be paid by the taxpayer divided by 12 (twelve).",
        lang
      )}</div>

      <div class="sp-gi-item"><b>15.</b> ${lbl(
    "Wajib Pajak yang menggunakan status kewajiban perpajakan suami-isteri kawin campur atau pisah harta dan penghasilan wajib melampirkan Lampiran S-II.",
    "Taxpayers who use the married mixed tax obligation status or separate property and income must attach Attachment S-II.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>16.</b> ${lbl(
    "Wajib Pajak yang tidak mempunyai penghasilan dari pekerjaan bebas tidak perlu mengisi Lampiran S-I.",
    "Taxpayers who do not have income from employment do not need to fill in Attachment S-I.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>17.</b> ${lbl(
    "Lampiran S-II berisi daftar harta dan kewajiban pada akhir tahun pajak serta daftar susunan anggota keluarga yang menjadi tanggungan.",
    "Attachment S-II contains a list of assets and liabilities at the end of the tax year and a list of family members who are dependents.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>18.</b> ${lbl(
    "Penandatanganan SPT Tahunan PPh wajib dilakukan oleh Wajib Pajak atau kuasanya. Jika ditandatangani oleh kuasa, harus dilampirkan Surat Kuasa Khusus yang asli.",
    "Signing of the Annual Income Tax Return must be done by the Taxpayer or their proxy. If signed by a proxy, the original Power of Attorney must be attached.",
        lang
      )}</div>


    </div>
    ${footForm(lang)}
  </div>`
}

// ========================================================================
// General Instructions - Formulir 1770
// ========================================================================

export function generalInstructions1770(lang = "bilingual") {
  const giSubtitle = lbl(
    "BAGI WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN DARI USAHA DAN/ATAU PEKERJAAN BEBAS.",
    "FOR TAXPAYER WHO HAVE INCOME FROM BUSINESS AND/OR FREELANCE WORK.",
    lang
  )

  return `<div class="sp-gi-page">${cornerMarkers()}${giHeader("1770", "PETUNJUK UMUM / GENERAL INSTRUCTIONS", "", giSubtitle, lang)}
    <div class="sp-gi-body">

      <div class="sp-gi-item"><b>1.</b> ${lbl(
        "Formulir ini telah sesuai dengan ketentuan Peraturan Direktur Jenderal Pajak Nomor PER-34/PJ/2010 tentang Surat Pemberitahuan Tahunan Pajak Penghasilan Wajib Pajak Orang Pribadi dan Wajib Pajak Badan beserta Petunjuk Pengisian sebagaimana telah diubah dengan Peraturan Direktur Jenderal Pajak Nomor PER-36/PJ/2015.",
        "This form is in compliance with the regulations of the Director General of Taxes Number PER-34/PJ/2010 about Income Tax Annual Return Form and General Instructions as amended by regulation the Director General of Taxes Number PER-36/PJ/2015.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>2.</b> ${lbl(
        "Cetak formulir ini dengan skala 98% (tidak dicetak dalam mode \"fit size\" atau \"shrink size\"). Hasil cetak harus ditandatangani dan tidak boleh dilipat atau dikusut. Gunakan kertas ukuran F4/Folio (8,5 x 13 inci), berat minimal 70 gram.",
        "Print this form in 98% scale (not printed in mode \"fit size\" or \"shrink size\"). This printing results must be signed and must not be folded or crumpled. Use HVS paper size F4/Folio (8.5 x 13 inch), minimum weight 70 gr.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>3.</b> ${lbl(
        "Untuk dapat menggunakan formulir ini secara optimal, gunakan aplikasi Adobe Reader versi 8 atau yang lebih baru.",
        "To be able to use this form optimally, use the application Adobe Reader version 8 or newer.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>4.</b> ${lbl(
        "Isi Tahun Pajak, identitas Wajib Pajak dan keterangan lain yang wajib diisi dengan benar.",
        "Complete the Taxable Year, the identity of the Taxpayer and the other mandatory information properly.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>5.</b> ${lbl(
        "Dalam mengisi kolom-kolom yang berisi nilai Rupiah, harus tanpa nilai desimal. Contoh: Sepuluh juta rupiah ditulis 10.000.000 (BUKAN 10.000.000,00).",
        "In filling in columns that contain Rupiah values, must be without decimal values. Example: Ten million rupiah is written 10,000,000 (NOT 10,000,000.00).",
        lang
      )}</div>

      <div class="sp-gi-item"><b>6.</b> ${lbl(
        "Jika Wajib Pajak membuat sendiri formulir SPT Tahunan PPh Orang Pribadi, jangan lupa untuk membuat &#9632; (segi empat hitam) di keempat sudut sebagai pembatas dokumen agar dokumen dapat dipindai.",
        "If the Taxpayer creates the Individual Annual Income Tax Return form, do not forget to create &#9632; (black squares) at the four corners as document boundaries so that the document can be scanned.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>7.</b> ${lbl(
        "Kode Lapangan Usaha (KLU) diisi sesuai dengan Keputusan Direktur Jenderal Pajak Nomor KEP-233/PJ/2012.",
        "Business Field Code (KLU) is filled in accordance with Regulation of the Director General of Taxes Number KEP-233/PJ/2012.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>8.</b> ${lbl(
        "Untuk pengisian angka-angka pada Bagian A sampai dengan Bagian G dapat dilihat pada Petunjuk Pengisian SPT Tahunan PPh Wajib Pajak Orang Pribadi.",
        "For filling in the numbers in Part A through Part G, refer to the Instructions for Filling Annual Income Tax Return for Individual Taxpayer.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>9.</b> ${lbl(
        "Bagian A diisi dengan penghasilan neto yang diterima/diperoleh dari usaha dan/atau pekerjaan bebas sesuai dengan peraturan perpajakan yang berlaku.",
        "Part A is filled with the net income received/obtained from business and/or freelance work in accordance with applicable tax regulations.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>10.</b> ${lbl(
        "Bagian B diisi dengan penghasilan neto yang diterima/diperoleh dari pekerjaan, penghasilan neto dalam negeri lainnya dan/atau penghasilan neto luar negeri. Rincian tercantum pada Lampiran I.",
        "Part B is filled with net income received/obtained from employment, other domestic net income and/or foreign net income. Details are listed in Attachment I.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>11.</b> ${lbl(
        "Bagian C diisi dengan pajak penghasilan terutang berdasarkan Pasal 17 Undang-Undang Pajak Penghasilan.",
        "Part C is filled with income tax payable based on Article 17 of the Income Tax Law.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>12.</b> ${lbl(
        "Bagian D diisi dengan pajak penghasilan yang telah dipotong atau dipungut oleh pihak lain dan pajak penghasilan yang telah dibayar sendiri.",
        "Part D is filled with income tax that has been withheld or collected by other parties and income tax that has been paid by the taxpayer.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>13.</b> ${lbl(
        "Bagian E diisi dengan jumlah kredit pajak yang terdiri dari pajak penghasilan yang dipotong atau dipungut oleh pihak lain, pajak penghasilan yang dibayar sendiri, dan pengembalian/pengurangan pajak penghasilan pasal 24.",
        "Part E is filled with the total tax credit consisting of income tax withheld or collected by other parties, income tax paid by the taxpayer, and income tax refund/reduction under Article 24.",
        lang
      )}</div>

      <div class="sp-gi-note">
        ${lbl(
          "Jika penghasilan kena pajak nihil atau kurang, kolom pajak penghasilan terutang di Bagian C diisi dengan angka 0 (nol).",
          "If the taxable income is nil or negative, the income tax payable column in Part C is filled with the number 0 (zero).",
          lang
        )}
      </div>

      <div class="sp-gi-item"><b>14.</b> ${lbl(
        "Bagian F diisi dengan angsuran PPh Pasal 25 yang terutang untuk tahun pajak berikutnya. Angsuran dihitung: jumlah PPh yang harus dibayar sendiri dibagi 12.",
        "Part F is filled with PPh Article 25 installments payable for the following tax year. Installments are calculated: total PPh to be paid by the taxpayer divided by 12.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>15.</b> ${lbl(
        "Wajib Pajak Orang Pribadi Pengusaha Tertentu yang tidak membuat pembukuan wajib melampirkan Surat Pernyataan (Lampiran I) yang memuat perhitungan penghasilan bruto dan penghasilan neto usaha.",
        "Certain Individual Entrepreneur Taxpayer who do not keep books must attach a Statement (Attachment I) containing the calculation of gross income and net business income.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>16.</b> ${lbl(
        "Bagian G diisi dengan lampiran-lampiran yang harus dilampirkan oleh Wajib Pajak, termasuk fotokopi formulir 1721-A1/A2, SSP lembar ke-3 PPh Pasal 29, surat kuasa khusus, dan dokumen pendukung lainnya.",
        "Part G is filled with attachments that must be attached by the Taxpayer, including photocopy of form 1721-A1/A2, SSP third sheet of PPh Article 29, special power of attorney, and other supporting documents.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>17.</b> ${lbl(
        "Wajib Pajak yang menggunakan status kewajiban perpajakan suami-isteri wajib melampirkan daftar harta dan kewajiban pada akhir tahun pajak beserta daftar susunan anggota keluarga.",
        "Taxpayers who use the married tax obligation status must attach a list of assets and liabilities at the end of the tax year along with a list of family members.",
        lang
      )}</div>

      <div class="sp-gi-item"><b>18.</b> ${lbl(
        "Penandatanganan SPT Tahunan PPh wajib dilakukan oleh Wajib Pajak atau kuasanya. Jika ditandatangani oleh kuasa, harus dilampirkan Surat Kuasa Khusus yang asli.",
        "Signing of the Annual Income Tax Return must be done by the Taxpayer or their proxy. If signed by a proxy, the original Power of Attorney must be attached.",
        lang
      )}</div>

    </div>
    ${footForm(lang)}
  </div>`
}


// ========================================================================
// Lampiran Helpers
// ========================================================================

function lampHeader(code, titleId, titleEn, tahunPajak, lang) {
  const tp = String(tahunPajak || '')
  const tpBoxes = (tp ? tp.padStart(4, '0').split('') : ['_', '_', '_', '_']).slice(-4).map(c => `<span class="sp-tp-box">${c === '_' ? '&nbsp;' : c}</span>`).join('')
  return `<div class="sp-lamp-title">
    <div class="sp-lamp-title-top">
      <div class="sp-lamp-title-code">${esc(code)}</div>
      <div class="sp-lamp-title-text">
        <div class="sp-sm">KEMENTERIAN KEUANGAN RI / MINISTRY OF FINANCE</div>
        <div class="sp-sm">DIREKTORAT JENDERAL PAJAK / DIRECTORATE GENERAL OF TAXES</div>
        <div class="sp-bold" style="font-size:10pt;">${lbl(titleId, titleEn, lang)}</div>
      </div>
      <div class="sp-lamp-title-tp">
        <div>TAHUN PAJAK / TAX YEAR</div>
        <div class="sp-tp-boxes">${tpBoxes}</div>
      </div>
    </div>
  </div>`
}

function lampSection(bagian, titleId, titleEn, lang) {
  return `<tr class="sp-lamp-sec"><th colspan="100">${lbl(bagian + ' ' + titleId, bagian + ' ' + titleEn, lang)}</th></tr>`
}

function lampColHeader(cols) {
  return `<tr>${cols.map(c => `<th style="font-size:7pt;${c.w ? 'width:' + c.w : ''}">${esc(c.label)}</th>`).join('')}</tr>`
}

function lampRow(num, cells, opts = {}) {
  const cls = opts.grand ? ' class="sp-grandrow"' : ''
  return `<tr${cls}><td class="sp-num" style="width:5%">${esc(String(num))}</td>${cells.map(c => `<td${c.cls ? ' class="' + c.cls + '"' : ''} style="${c.style || ''}">${c.html || esc(String(c.val ?? ''))}</td>`).join('')}</tr>`
}

function lampTotalRow(label, val) {
  return `<tr class="sp-grandrow"><td class="sp-num" style="width:5%"></td><td colspan="100" style="text-align:left; font-weight:bold; padding-left:8px; font-size:7.5pt;">${esc(label)}</td><td class="sp-cell-val" style="width:20%">${rp(val)}</td></tr>`
}

// ========================================================================
// Lampiran Placeholders (extend as needed)
// ========================================================================

export function LAMPIRAN_I_1770(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const dnLainnya = data?.penghasilan?.dalam_negeri_lainnya || []
  const bukanObjek = data?.penghasilan?.bukan_objek || []
  const pemotongan = data?.kredit_pajak?.pemotongan || []

  const totalDNLainnya = dnLainnya.reduce((s, r) => s + (Number(r.penghasilan_neto) || 0), 0)
  const totalBukanObjek = bukanObjek.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)
  const totalPemotongan = pemotongan.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)

  const colsDN = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '40%' },
    { label: 'PENGHASILAN BRUTO<br>GROSS INCOME', w: '20%' },
    { label: 'PENGHASILAN NETO<br>NET INCOME', w: '20%' },
  ]
  const colsBO = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '55%' },
    { label: 'JUMLAH<br>AMOUNT', w: '20%' },
  ]
  const colsPem = [
    { label: 'NO.' },
    { label: 'NAMA PEMOTONG<br>WITHHOLDER NAME', w: '18%' },
    { label: 'NPWP', w: '12%' },
    { label: 'BUKTI POTONG<br>WITHHOLDING DOC.' },
    { label: 'TANGGAL<br>DATE' },
    { label: 'JENIS PAJAK<br>TAX TYPE' },
    { label: 'JUMLAH PPh<br>PPh AMOUNT', w: '14%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'PENGHASILAN NETO DALAM NEGERI LAINNYA', 'OTHER DOMESTIC NET INCOME', lang),
    lampColHeader(colsDN),
    ...dnLainnya.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: formatAngka(r.penghasilan_bruto) },
      { val: formatAngka(r.penghasilan_neto) },
    ])),
    lampTotalRow('JUMLAH PENGHASILAN NETO DALAM NEGERI LAINNYA / TOTAL OTHER DOMESTIC NET INCOME', totalDNLainnya),
    lampSection('BAGIAN B', 'PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK', 'INCOME NOT SUBJECT TO TAX', lang),
    lampColHeader(colsBO),
    ...bukanObjek.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PENGHASILAN TIDAK TERMASUK OBJEK PAJAK / TOTAL NON-TAXABLE INCOME', totalBukanObjek),
    lampSection('BAGIAN C', 'DAFTAR PEMOTONGAN/PEMUNGUTAN PPh YANG DILAKUKAN OLEH PIHAK LAIN', 'LIST OF INCOME TAX WITHHOLDING BY OTHER PARTIES', lang),
    lampColHeader(colsPem),
    ...pemotongan.map((r, i) => lampRow(i + 1, [
      { val: r.nama || '' },
      { val: r.npwp || '' },
      { val: r.no_bukti || '' },
      { val: r.tanggal || '' },
      { val: r.jenis ? (`Pasal ${r.jenis}`) : '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PPh YANG DIPOTONG/DIPUNGUT / TOTAL WITHHELD PPh', totalPemotongan),
  ]

  return (`<div class="sp-page">${cornerMarkers()}${lampHeader('1770-I', 'LAMPIRAN I', 'ATTACHMENT I', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <div class="sp-sm" style="margin-bottom:2mm; padding:0 2mm;">${lbl('Untuk diisi oleh Wajib Pajak yang mempunyai penghasilan dari usaha dan/atau pekerjaan bebas yang tidak membuat pembukuan atau tidak menggunakan sistem pembukuan sederhana.', 'To be filled by Taxpayers who have income from business and/or freelance work and do not keep books or do not use a simplified bookkeeping system.', lang)}</div>
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`)
}

export function LAMPIRAN_II_1770(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const finalItems = data?.penghasilan?.final || []
  const totalFinal = finalItems.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)

  const colsFinal = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '50%' },
    { label: 'TARIF<br>RATE' },
    { label: 'PENGHASILAN BRUTO<br>GROSS INCOME', w: '20%' },
    { label: 'PPh TERUTANG<br>TAX PAYABLE', w: '18%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'PENGHASILAN YANG DIKENAKAN PPh FINAL ATAU YANG BERSIFAT FINAL', 'INCOME SUBJECT TO FINAL TAX OR FINALIZED TAX', lang),
    lampColHeader(colsFinal),
    ...finalItems.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: r.tarif ? (r.tarif + '%') : '' },
      { val: formatAngka(r.penghasilan_bruto) },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PPh FINAL / TOTAL FINAL PPh', totalFinal),
  ]

  return (`<div class="sp-page">${cornerMarkers()}${lampHeader('1770-II', 'LAMPIRAN II', 'ATTACHMENT II', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <div class="sp-sm" style="margin-bottom:2mm; padding:0 2mm;">${lbl('Untuk diisi oleh Wajib Pajak yang mempunyai penghasilan yang dikenakan PPh Final atau yang bersifat final.', 'To be filled by Taxpayers who have income subject to final tax or finalized tax.', lang)}</div>
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`)
}

export function LAMPIRAN_III_1770(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const tanggungan = data?.tanggungan || []

  const colsTanggungan = [
    { label: 'NO.' },
    { label: 'NAMA<br>NAME', w: '22%' },
    { label: 'NO. KTP / NIK', w: '16%' },
    { label: 'HUBUNGAN<br>RELATIONSHIP', w: '16%' },
    { label: 'TANGGAL LAHIR<br>DATE OF BIRTH', w: '14%' },
    { label: 'PEKERJAAN<br>OCCUPATION', w: '18%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'DAFTAR SUSUNAN ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN', 'LIST OF FAMILY MEMBERS WHO ARE DEPENDENTS', lang),
    lampColHeader(colsTanggungan),
    ...tanggungan.map((r, i) => lampRow(i + 1, [
      { val: r.nama || '' },
      { val: r.nik || '' },
      { val: r.hubungan || '' },
      { val: r.tanggal_lahir || '' },
      { val: r.pekerjaan || '' },
    ])),
  ]

  return (`<div class="sp-page">${cornerMarkers()}${lampHeader('1770-III', 'LAMPIRAN III', 'ATTACHMENT III', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <div class="sp-sm" style="margin-bottom:2mm; padding:0 2mm;">${lbl('Untuk diisi oleh Wajib Pajak yang memiliki suami/isteri dan/atau anak yang menjadi tanggungan. Data ini digunakan untuk menentukan PTKP.', 'To be filled by Taxpayers who have a spouse and/or children who are dependents. This data is used to determine Non-Taxable Income (PTKP).', lang)}</div>
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`)
}

export function LAMPIRAN_IV_1770(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const harta = data?.harta || []
  const utang = data?.utang || []

  const totalHarta = harta.reduce((s, r) => s + (Number(r.harga_perolehan) || 0), 0)
  const totalUtang = utang.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)

  const colsHarta = [
    { label: 'NO.' },
    { label: 'KODE' },
    { label: 'NAMA HARTA<br>ASSET NAME', w: '28%' },
    { label: 'TAHUN PEROLEHAN<br>YEAR ACQUIRED' },
    { label: 'HARGA PEROLEHAN<br>ACQUISITION COST', w: '16%' },
    { label: 'KETERANGAN<br>NOTES', w: '18%' },
  ]
  const colsUtang = [
    { label: 'NO.' },
    { label: 'KODE' },
    { label: 'NAMA PEMBERI<br>CREDITOR NAME', w: '22%' },
    { label: 'ALAMAT<br>ADDRESS', w: '22%' },
    { label: 'TAHUN<br>YEAR' },
    { label: 'JUMLAH<br>AMOUNT', w: '14%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'DAFTAR HARTA PADA AKHIR TAHUN PAJAK', 'LIST OF ASSETS AT END OF FISCAL YEAR', lang),
    lampColHeader(colsHarta),
    ...harta.map((r, i) => lampRow(i + 1, [
      { val: r.kode || '' },
      { val: r.nama || '' },
      { val: r.tahun_perolehan || '' },
      { val: formatAngka(r.harga_perolehan) },
      { val: r.keterangan || '' },
    ])),
    lampTotalRow('JUMLAH HARTA / TOTAL ASSETS', totalHarta),
    lampSection('BAGIAN B', 'KEWAJIBAN/UTANG PADA AKHIR TAHUN PAJAK', 'LIABILITIES/DEBTS AT END OF FISCAL YEAR', lang),
    lampColHeader(colsUtang),
    ...utang.map((r, i) => lampRow(i + 1, [
      { val: r.kode || '' },
      { val: r.nama_pemberi || '' },
      { val: r.alamat_pemberi || '' },
      { val: r.tahun_peminjaman || '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH UTANG / TOTAL DEBTS', totalUtang),
  ]

  return (`<div class="sp-page">${cornerMarkers()}${lampHeader('1770-IV', 'LAMPIRAN IV', 'ATTACHMENT IV', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <div class="sp-sm" style="margin-bottom:2mm; padding:0 2mm;">${lbl('Untuk diisi oleh Wajib Pajak yang mempunyai harta dan/atau kewajiban pada akhir tahun pajak.', 'To be filled by Taxpayers who have assets and/or liabilities at the end of the tax year.', lang)}</div>
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`)
}

export function LAMPIRAN_S_I(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const dnLainnya = data?.penghasilan?.dalam_negeri_lainnya || []
  const bukanObjek = data?.penghasilan?.bukan_objek || []
  const pemotongan = data?.kredit_pajak?.pemotongan || []

  const totalDNLainnya = dnLainnya.reduce((s, r) => s + (Number(r.penghasilan_neto) || 0), 0)

  const totalBukanObjek = bukanObjek.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)
  const totalPemotongan = pemotongan.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)

  const colsDN = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '40%' },
    { label: 'PENGHASILAN BRUTO<br>GROSS INCOME', w: '20%' },
    { label: 'PENGHASILAN NETO<br>NET INCOME', w: '20%' },
  ]

  const colsBO = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '55%' },
    { label: 'JUMLAH<br>AMOUNT', w: '20%' },
  ]

  const colsPem = [
    { label: 'NO.' },
    { label: 'NAMA PEMOTONG<br>WITHHOLDER NAME', w: '18%' },
    { label: 'NPWP', w: '12%' },
    { label: 'BUKTI POTONG<br>WITHHOLDING DOC.' },
    { label: 'TANGGAL<br>DATE' },
    { label: 'JENIS PAJAK<br>TAX TYPE' },
    { label: 'JUMLAH PPh<br>PPh AMOUNT', w: '14%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'PENGHASILAN NETO DALAM NEGERI LAINNYA', 'OTHER DOMESTIC NET INCOME', lang),
    lampColHeader(colsDN),
    ...dnLainnya.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: formatAngka(r.penghasilan_bruto) },
      { val: formatAngka(r.penghasilan_neto) },
    ])),
    lampTotalRow('JUMLAH PENGHASILAN NETO DALAM NEGERI LAINNYA / TOTAL OTHER DOMESTIC NET INCOME', totalDNLainnya),
    lampSection('BAGIAN B', 'PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK', 'INCOME NOT SUBJECT TO TAX', lang),
    lampColHeader(colsBO),
    ...bukanObjek.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PENGHASILAN TIDAK TERMASUK OBJEK PAJAK / TOTAL NON-TAXABLE INCOME', totalBukanObjek),
    lampSection('BAGIAN C', 'DAFTAR PEMOTONGAN/PEMUNGUTAN PPh YANG DILAKUKAN OLEH PIHAK LAIN', 'LIST OF INCOME TAX WITHHOLDING BY OTHER PARTIES', lang),
    lampColHeader(colsPem),
    ...pemotongan.map((r, i) => lampRow(i + 1, [
      { val: r.nama || '' },
      { val: r.npwp || '' },
      { val: r.no_bukti || '' },
      { val: r.tanggal || '' },
      { val: r.jenis ? `Pasal ${r.jenis}` : '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PPh YANG DIPOTONG/DIPUNGUT / TOTAL WITHHELD PPh', totalPemotongan),
  ]

  return `<div class="sp-page">${cornerMarkers()}${lampHeader('1770 S - I', 'LAMPIRAN S-I', 'ATTACHMENT S-I', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <div class="sp-sm" style="margin-bottom:2mm; padding:0 2mm;">Untuk diisi oleh Wajib Pajak yang mempunyai penghasilan dari satu atau lebih pemberi kerja</div>
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`
}

export function LAMPIRAN_S_II(data, calc, lang = 'bilingual') {
  const ind = data?.identitas || {}
  const finalItems = data?.penghasilan?.final || []
  const harta = data?.harta || []
  const utang = data?.utang || []
  const tanggungan = data?.tanggungan || []

  const totalFinal = finalItems.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)
  const totalHarta = harta.reduce((s, r) => s + (Number(r.harga_perolehan) || 0), 0)
  const totalUtang = utang.reduce((s, r) => s + (Number(r.jumlah) || 0), 0)

  const colsFinal = [
    { label: 'NO.' },
    { label: 'JENIS PENGHASILAN<br>TYPE OF INCOME', w: '60%' },
    { label: 'JUMLAH<br>AMOUNT', w: '20%' },
  ]

  const colsHarta = [
    { label: 'NO.' },
    { label: 'KODE' },
    { label: 'NAMA HARTA<br>ASSET NAME', w: '28%' },
    { label: 'TAHUN PEROLEHAN<br>YEAR ACQUIRED' },
    { label: 'HARGA PEROLEHAN<br>ACQUISITION COST', w: '16%' },
    { label: 'KETERANGAN<br>NOTES', w: '18%' },
  ]

  const colsUtang = [
    { label: 'NO.' },
    { label: 'KODE' },
    { label: 'NAMA PEMBERI<br>CREDITOR NAME', w: '22%' },
    { label: 'ALAMAT<br>ADDRESS', w: '22%' },
    { label: 'TAHUN<br>YEAR' },
    { label: 'JUMLAH<br>AMOUNT', w: '14%' },
  ]

  const colsTanggungan = [
    { label: 'NO.' },
    { label: 'NAMA<br>NAME', w: '24%' },
    { label: 'NO. KTP / NIK', w: '18%' },
    { label: 'HUBUNGAN<br>RELATIONSHIP', w: '16%' },
    { label: 'PEKERJAAN<br>OCCUPATION', w: '22%' },
  ]

  const rows = [
    lampSection('BAGIAN A', 'PENGHASILAN YANG DIKENAKAN PAPh FINAL', 'INCOME SUBJECT TO FINAL TAX', lang),
    lampColHeader(colsFinal),
    ...finalItems.map((r, i) => lampRow(i + 1, [
      { val: r.jenis_penghasilan || '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH PENGHASILAN FINAL / TOTAL FINAL INCOME', totalFinal),
    lampSection('BAGIAN B', 'HARTA PADA AKHIR TAHUN PAJAK', 'ASSETS AT END OF FISCAL YEAR', lang),
    lampColHeader(colsHarta),
    ...harta.map((r, i) => lampRow(i + 1, [
      { val: r.kode || '' },
      { val: r.nama || '' },
      { val: r.tahun_perolehan || '' },
      { val: formatAngka(r.harga_perolehan) },
      { val: r.keterangan || '' },
    ])),
    lampTotalRow('JUMLAH HARTA / TOTAL ASSETS', totalHarta),
    lampSection('BAGIAN C', 'KEWAJIBAN/UTANG PADA AKHIR TAHUN PAJAK', 'LIABILITIES/DEBTS AT END OF FISCAL YEAR', lang),
    lampColHeader(colsUtang),
    ...utang.map((r, i) => lampRow(i + 1, [
      { val: r.kode || '' },
      { val: r.nama_pemberi || '' },
      { val: r.alamat_pemberi || '' },
      { val: r.tahun_peminjaman || '' },
      { val: formatAngka(r.jumlah) },
    ])),
    lampTotalRow('JUMLAH UTANG / TOTAL DEBTS', totalUtang),
    lampSection('BAGIAN D', 'DAFTAR SUSUNAN ANGGOTA KELUARGA', 'LIST OF FAMILY MEMBERS', lang),
    lampColHeader(colsTanggungan),
    ...tanggungan.map((r, i) => lampRow(i + 1, [
      { val: r.nama || '' },
      { val: r.nik || '' },
      { val: r.hubungan || '' },
      { val: r.pekerjaan || '' },
    ])),
  ]

  return `<div class="sp-page">${cornerMarkers()}${lampHeader('1770 S - II', 'LAMPIRAN S-II', 'ATTACHMENT S-II', ind.tahun_pajak, lang)}
    <div class="sp-body">
      <table class="sp-lamp-table"><tbody>${rows.join('')}</tbody></table>
    </div>
    ${footForm(lang)}
  </div>`
}

// ========================================================================
// Entry Point - Build Pages Array
// ========================================================================

export function buildPages(formType, data, calc, lang = 'bilingual') {
  if (!data || !calc) return []
  
  if (formType === '1770S') {
    return [generalInstructions1770S(lang), INDUK1770S(data, calc, lang), LAMPIRAN_S_I(data, calc, lang), LAMPIRAN_S_II(data, calc, lang)]
  } else {
    return [generalInstructions1770(lang), INDUK1770(data, calc, lang), LAMPIRAN_I_1770(data, calc, lang), LAMPIRAN_II_1770(data, calc, lang), LAMPIRAN_III_1770(data, calc, lang), LAMPIRAN_IV_1770(data, calc, lang)]
  }
}
