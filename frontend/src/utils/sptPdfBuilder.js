/**
 * Builder HTML cetak (PDF) untuk SPT Tahunan PPh Orang Pribadi
 * (Formulir 1770 dan 1770S).
 *
 * Layout mengikuti tata letak resmi DJP (bilingual TRF 1770-2016 dan
 * 1770S-2016):
 *   - Header Kementerian Keuangan RI / Directorate General of Taxes
 *   - Formulir Induk bernomor sesuai resmi dengan bilingual labels
 *   - Lampiran I-IV (1770) / Lampiran S-I & S-II (1770S)
 * 
 * Mendukung mode bilingual (Indonesia + Inggris) sesuai format resmi TRF DJP.
 *
 * Dicetak via window.print() -> user memilih "Save as PDF" (browser),
 * sesuai pola yang dipakai reportPdfBuilder.js.
 */

// Import shared generators with bilingual support
import {
  formatAngka, rp, esc, checkBox, statusKawinLabel, tanggalCetak,
  INDUK1770_CSS, PREVIEW_CSS,
  INDUK1770 as induk1770, INDUK1770S as induk1770S,
  LAMPIRAN_I_1770 as lampiranI1770, LAMPIRAN_II_1770 as lampiranII1770,
  LAMPIRAN_III_1770 as lampiranIII1770, LAMPIRAN_IV_1770 as lampiranIV1770,
  LAMPIRAN_S_I as lampiranS_I, LAMPIRAN_S_II as lampiranS_II,
  buildPages,
} from './sptFormGenerators.js'

/* ========================================================================
    CSS for PDF Generation
    ======================================================================== */

const SPT_PDF_CSS = `
${INDUK1770_CSS}
@media print { @page { size: 216mm 330mm; margin: 8mm; } }
`

/* ========================================================================
    Entry Point - Generate Complete PDF-ready HTML
    ======================================================================== */

export function buildSptPrintHtml(data, calc, formType, lang = 'bilingual') {
  if (!data || !calc) return ''
  
  const pages = buildPages(formType, data, calc, lang)
  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>SPT Tahunan ${formType} - Tahun Pajak ${data.identitas?.tahun_pajak || ''}</title>
  <style>${SPT_PDF_CSS}</style>
</head>
<body>
  ${pages.join('\n')}
</body>
</html>`
  
  return fullHtml
}

/* ========================================================================
    Export Individual Components for Testing
    ======================================================================== */

export { INDUK1770_CSS, PREVIEW_CSS }
