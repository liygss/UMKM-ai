/**
 * Builder HTML cetak (PDF) untuk SPT Tahunan PPh Orang Pribadi
 * (Formulir 1770 dan 1770S).
 *
 * Layout mengikuti tata letak resmi DJP (bilingual TRF 1770-2016 dan
 * 1770S-2016):
 *   - Header Kementerian Keuangan RI / DJP + kotak identitas
 *   - Formulir Induk bernomor sesuai resmi (1770: 1-21 dgn bagian A-G;
 *     1770S: 1-18 dgn bagian A-D)
 *   - Lampiran I-IV (1770) / Lampiran I-II (1770S)
 *
 * Dicetak via window.print() -> user memilih "Save as PDF" (browser),
 * sesuai pola yang dipakai reportPdfBuilder.js.
 */

function formatAngka(val) {
  if (val === undefined || val === null || val === '' || isNaN(val)) return ''
  const n = Math.round(Number(val))
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
}

function rp(val) {
  const n = Number(val || 0)
  return formatAngka(n)
}

function esc(val) {
  if (val === undefined || val === null) return ''
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function checkBox(active) {
  return `<span class="sp-cbx">${active ? 'X' : ''}</span>`
}

function statusKawinLabel(status) {
  const map = { KK: 'KK', HB: 'HB', PH: 'PH', MT: 'MT' }
  return map[status] || 'KK'
}

function tanggalCetak() {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/* ========================================================================
   CSS (print)
   ======================================================================== */
const SPT_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: white; }
body {
  font-family: 'Times New Roman', Times, Georgia, serif;
  color: #000;
  font-size: 9pt;
  line-height: 1.25;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@page { size: A4 portrait; margin: 8mm 8mm; }

.sp-page {
  width: 100%;
  min-height: 264mm;
  page-break-after: always;
  padding: 0;
}
.sp-page:last-child { page-break-after: auto; }

.sp-center { text-align: center; }
.sp-bold { font-weight: bold; }
.sp-sm { font-size: 8pt; }
.sp-xs { font-size: 7pt; }
.sp-right { text-align: right; white-space: nowrap; }
.sp-mono { font-family: 'Courier New', monospace; }
.sp-num { text-align: center; white-space: nowrap; }

.sp-cbx {
  display: inline-block; width: 10px; height: 10px;
  border: 1px solid #000; text-align: center;
  font-size: 8px; line-height: 8px; font-weight: bold; vertical-align: middle;
}
.sp-kotak { border: 1px solid #000; display: inline-block; padding: 0 4px; }

/* ===== Header ===== */
.sp-hdr { border: 1.5px solid #000; margin-bottom: 2mm; }
.sp-hdr-top {
  display: flex; justify-content: space-between; align-items: stretch;
  border-bottom: 1.5px solid #000;
}
.sp-hdr-code {
  width: 22%; border-right: 1.5px solid #000;
  display: flex; align-items: center; justify-content: center;
  font-size: 13pt; font-weight: bold; padding: 2px;
}
.sp-hdr-title { flex: 1; text-align: center; padding: 2px 6px; }
.sp-hdr-tp {
  width: 22%; border-left: 1.5px solid #000;
  display: flex; flex-direction: column; justify-content: center;
  align-items: center; padding: 2px; font-size: 7.5pt;
}
.sp-tp-boxes { display: flex; gap: 2px; margin-top: 2px; }
.sp-tp-box { width: 14px; height: 15px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 9pt; font-weight: bold; }

.sp-id-table { width: 100%; border-collapse: collapse; }
.sp-id-table td { border: 1px solid #000; padding: 1px 5px; vertical-align: middle; }
.sp-id-lbl { font-weight: bold; white-space: nowrap; padding-right: 4px; }
.sp-id-val { border-bottom: 1px solid #000; min-width: 60px; padding: 0 4px; display: inline-block; }

.sp-note-banner {
  border: 1px solid #000; border-top: none;
  font-size: 6.5pt; text-align: center; padding: 1px 4px;
}

/* ===== Induk table ===== */
.sp-table { width: 100%; border-collapse: collapse; margin-top: 2mm; }
.sp-table th, .sp-table td { border: 1px solid #000; padding: 2px 4px; vertical-align: top; }
.sp-table th { background: #fff; text-align: center; font-weight: bold; font-size: 8pt; }
.sp-sec th {
  text-align: left; font-size: 8pt; padding: 2px 6px;
  background: #d9d9d9; font-weight: bold;
}
.sp-grandrow td { background: #eaeaea; font-weight: bold; }
.sp-subrow td { font-size: 8pt; padding-left: 14px; }
.sp-row-lbl { text-align: left; }
.sp-cell-val { text-align: right; font-family: 'Courier New', monospace; white-space: nowrap; width: 24%; }

.sp-induk { font-size: 6.5pt; margin-top: 1mm; }
.sp-induk td { padding: 0.5px 3px; }
.sp-induk th { padding: 0.5px 3px; font-size: 6.5pt; }
.sp-induk .sp-sec th { font-size: 6.5pt; padding: 0.5px 6px; }
.sp-induk .sp-xs { font-size: 5.8pt; }

/* ===== Pernyataan & tanda tangan ===== */
.sp-pernyataan { border: 1px solid #000; margin-top: 1mm; font-size: 7pt; }
.sp-pernyataan .sp-title2 { font-weight: bold; text-align: center; padding: 1px; border-bottom: 1px solid #000; }
.sp-pernyataan p { padding: 1px 6px; text-align: justify; }
.sp-sign-row { display: flex; }

.sp-sign-row > div { flex: 1; border: 1px solid #000; border-top: none; padding: 1px 6px; }
.sp-sign-name { margin-top: 2mm; border-bottom: 1px solid #000; text-align: center; padding-bottom: 1px; font-weight: bold; }
.sp-sign-space { height: 12mm; }

.sp-foot { font-size: 6.5pt; color: #333; border: 1px solid #000; border-top: none; padding: 2px 5px; }

.sp-sub-label { padding-left: 14px !important; font-size: 7.5pt; }
.sp-legend { font-size: 7pt; margin-top: 2mm; }
.sp-lampiran-check td { font-size: 6pt; padding: 1px 3px; }
.sp-note { font-size: 6.8pt; margin-top: 1mm; }
`

/* ========================================================================
   Helpers (bagian halaman)
   ======================================================================== */

function headerForm({ code, title, tahunPajak, npwp, nama, pembetulan, extra, tpId }) {
  const tp = String(tahunPajak || '')
  const tpBoxes = (tp ? tp.padStart(4, '0').split('') : ['_', '_', '_', '_'])
    .slice(-4)
    .map(c => `<span class="sp-tp-box">${c === '_' ? '&nbsp;' : c}</span>`)
    .join('')
  return `
  <div class="sp-hdr">
    <div class="sp-hdr-top">
      <div class="sp-hdr-code">${esc(code)}</div>
      <div class="sp-hdr-title">
        <div class="sp-sm">KEMENTERIAN KEUANGAN RI</div>
        <div class="sp-sm">DIREKTORAT JENDERAL PAJAK</div>
        <div class="sp-bold" style="font-size:11pt; letter-spacing:0.3px;">SPT TAHUNAN PPh WAJIB PAJAK ORANG PRIBADI</div>
        <div class="sp-sm">${esc(title || '')}</div>
      </div>
      <div class="sp-hdr-tp">
        <div>TAHUN PAJAK</div>
        <div class="sp-tp-boxes">${tpBoxes}</div>
      </div>
    </div>
    <table class="sp-id-table">
      <tr>
        <td class="sp-id-lbl" style="width:22%">NPWP</td>
        <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:90px">${esc(npwp)}</span></td>
        <td class="sp-id-lbl" style="width:28%">NAMA WAJIB PAJAK</td>
        <td class="sp-sm"><span class="sp-id-val" style="min-width:110px">${esc(nama)}</span></td>
      </tr>
      ${extra || ''}
    </table>
    <div class="sp-note-banner">
      PERHATIAN : SEBELUM MENGISI BACALAH PETUNJUK PENGISIAN. ISI DENGAN HURUF CETAK / DIKETIK DENGAN TINTA HITAM.
      BERI TANDA &quot;X&quot; DALAM <span class="sp-cbx"></span> (KOTAK PILIHAN) YANG SESUAI.
      ${pembetulan ? ` SPT PEMBETULAN KE - <span class="sp-kotak sp-bold">${esc(pembetulan)}</span>` : ''}
    </div>
  </div>`
}

function idRow(label, value, opts = {}) {
  const w = opts.width ? ` style="width:${opts.width}"` : ''
  return `<td class="sp-id-lbl"${w}>${esc(label)}</td><td class="sp-sm"><span class="sp-id-val"${opts.vw ? ` style="min-width:${opts.vw}"` : ''}>${esc(value)}</span></td>`
}

function statusRow(status) {
  const s = statusKawinLabel(status)
  return `${checkBox(s === 'KK')} KK &nbsp; ${checkBox(s === 'HB')} HB &nbsp; ${checkBox(s === 'PH')} PH &nbsp; ${checkBox(s === 'MT')} MT`
}

function identitas1770(ind) {
  return `
    <tr>
      <td class="sp-id-lbl" style="width:22%">JENIS USAHA/PEKERJAAN BEBAS</td>
      <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:90px">${esc(ind.jenis_usaha)}</span></td>
      <td class="sp-id-lbl" style="width:28%">NO. TELEPON/FAKSIMILI</td>
      <td class="sp-sm"><span class="sp-id-val" style="min-width:60px">${esc(ind.no_telepon)}</span><span class="sp-xs"> / </span><span class="sp-id-val" style="min-width:60px">${esc(ind.no_faks)}</span></td>
    </tr>
    <tr>
      <td class="sp-id-lbl" style="width:22%">KLU</td>
      <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:60px">${esc(ind.klu)}</span></td>
      <td class="sp-id-lbl" style="width:28%">STATUS KEWAJIBAN PERPAJAKAN SUAMI-ISTERI</td>
      <td class="sp-sm">${statusRow(ind.status_kawin)}</td>
    </tr>
    <tr>
      <td class="sp-id-lbl" style="width:22%">NPWP ISTERI/SUAMI</td>
      <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:90px">${esc(ind.npwp_pasangan)}</span></td>
      <td class="sp-id-lbl" style="width:28%">ALAMAT</td>
      <td class="sp-sm"><span class="sp-id-val" style="min-width:110px">${esc(ind.alamat)}</span></td>
    </tr>`
}

function identitas1770S(ind) {
  return `
    <tr>
      <td class="sp-id-lbl" style="width:22%">PEKERJAAN</td>
      <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:90px">${esc(ind.pekerjaan_utama)}</span></td>
      <td class="sp-id-lbl" style="width:28%">NO. TELEPON</td>
      <td class="sp-sm"><span class="sp-id-val" style="min-width:60px">${esc(ind.no_telepon)}</span></td>
    </tr>
    <tr>
      <td class="sp-id-lbl" style="width:22%">KLU</td>
      <td class="sp-sm" style="width:28%"><span class="sp-id-val" style="min-width:60px">${esc(ind.klu)}</span></td>
      <td class="sp-id-lbl" style="width:28%">NO. FAKSIMILI</td>
      <td class="sp-sm"><span class="sp-id-val" style="min-width:60px">${esc(ind.no_faks)}</span></td>
    </tr>
    <tr>
      <td class="sp-id-lbl" style="width:22%">STATUS KEWAJIBAN PERPAJAKAN SUAMI-ISTERI</td>
      <td class="sp-sm" style="width:28%">${statusRow(ind.status_kawin)}</td>
      <td class="sp-id-lbl" style="width:28%">NPWP ISTERI/SUAMI</td>
      <td class="sp-sm"><span class="sp-id-val" style="min-width:90px">${esc(ind.npwp_pasangan)}</span></td>
    </tr>`
}

function secHeader(label) {
  return `<tr class="sp-sec"><th colspan="3">${esc(label)}</th></tr>`
}

function rowNum(num, label, val, opts = {}) {
  const cls = opts.grand ? ' class="sp-grandrow"' : ''
  return `<tr${cls}>
    <td class="sp-num" style="width:8%">${esc(num)}</td>
    <td class="sp-row-lbl">${label}</td>
    <td class="sp-cell-val">${rp(val)}</td>
  </tr>`
}

function rowNumSub(num, label, val, subLabel) {
  return `<tr>
    <td class="sp-num" style="width:8%">${esc(num)}</td>
    <td class="sp-row-lbl">${label}</td>
    <td class="sp-cell-val">${rp(val)}</td>
  </tr><tr>
    <td class="sp-num"></td>
    <td class="sp-sub-label">${esc(subLabel)}</td>
    <td class="sp-cell-val"></td>
  </tr>`
}

function rowAB(num, title, items) {
  // items: [{label, val, bold}]
  const rows = items.map((it, i) => `
    <tr${it.bold ? ' class="sp-grandrow"' : ''}>
      <td class="sp-num" style="width:8%">${i === 0 ? esc(num) : ''}</td>
      <td class="sp-row-lbl${i === 0 ? '' : ' sp-sub-label'}">${esc(it.label)}</td>
      <td class="sp-cell-val">${rp(it.val)}</td>
    </tr>`).join('')
  return rows
}

function footForm(disclaimer) {
  return `
  <div class="sp-foot">
    Dokumen ini dibuat oleh AI UMKM sebagai alat bantu isian SPT Tahunan dan bukan pengganti e-Form/e-Filing resmi DJP.
    ${disclaimer || 'Perhitungan berdasarkan data yang diisi — wajib diperiksa ulang sebelum disampaikan.'}
    Dicetak: ${tanggalCetak()}.
  </div>`
}

function pernyataan(nama, extraRows) {
  return `
  <div class="sp-pernyataan">
    <div class="sp-title2">PERNYATAAN</div>
    <p>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan
    perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta
    lampiran-lampirannya adalah benar, lengkap dan jelas.</p>
    <div class="sp-sign-row">
      <div>
        <div class="sp-xs sp-bold">TANGGAL :</div>
        <div class="sp-xs">TANDA TANGAN</div>
        <div class="sp-sign-space">&nbsp;</div>
        <div class="sp-xs">NAMA LENGKAP / FULL NAME</div>
        <div class="sp-sign-name">${esc(nama)}</div>
        <div class="sp-xs sp-center sp-bold">TAXPAYER</div>
        <div class="sp-xs sp-center">WAJIB PAJAK</div>
      </div>
      <div>
        <div class="sp-xs sp-bold">TANGGAL :</div>
        <div class="sp-xs">TANDA TANGAN</div>
        <div class="sp-sign-space">&nbsp;</div>
        <div class="sp-xs">NAMA LENGKAP / FULL NAME</div>
        <div class="sp-sign-name">&nbsp;</div>
        <div class="sp-xs sp-center sp-bold">PROXY</div>
        <div class="sp-xs sp-center">KUASA</div>
      </div>
      ${extraRows || ''}
    </div>
  </div>`
}

/* ========================================================================
   FORMULIR INDUK 1770
   ======================================================================== */

function induk1770(data, calc) {
  const ind = data?.identitas || {}
  const permohonan = data?.permohonan || {}
  const rest = permohonan.restitusi || ''
  const st = statusKawinLabel(ind.status_kawin)

  const rows = [
    secHeader('A. PENGHASILAN NETO'),
    rowNum('1.', 'PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS<br><span class="sp-xs">[dari 1770-I Halaman 1 Jumlah Bag.A / Halaman 2 Jumlah Bag.B Kolom 5]</span>', calc.angka_1),
    rowNum('2.', 'PENGHASILAN NETO DALAM NEGERI SEHUBUNGAN DENGAN PEKERJAAN<br><span class="sp-xs">[dari 1770-I Halaman 2 Jumlah Bagian C Kolom 5]</span>', calc.angka_2),
    rowNum('3.', 'PENGHASILAN NETO DALAM NEGERI LAINNYA<br><span class="sp-xs">[dari 1770-I Halaman 2 Jumlah Bagian D Kolom 3]</span>', calc.angka_3),
    rowNum('4.', 'PENGHASILAN NETO LUAR NEGERI<br><span class="sp-xs">[isi dari Lampiran Tersendiri, lihat petunjuk pengisian]</span>', calc.angka_4),
    rowNum('5.', 'JUMLAH PENGHASILAN NETO (1 + 2 + 3 + 4)', calc.angka_5, { grand: true }),
    rowNum('6.', 'ZAKAT / SUMBANGAN KEAGAMAAN YANG BERSIFAT WAJIB', calc.angka_6),
    rowNum('7.', 'JUMLAH PENGHASILAN NETO SETELAH PENGURANGAN ZAKAT/SUMBANGAN KEAGAMAAN YANG SIFATNYA WAJIB (5 - 6)', calc.angka_7, { grand: true }),

    secHeader('B. PENGHASILAN KENA PAJAK'),
    rowNum('8.', 'KOMPENSASI KERUGIAN', calc.angka_8),
    rowNum('9.', 'JUMLAH PENGHASILAN NETO SETELAH KOMPENSASI KERUGIAN (7 - 8)', calc.angka_9, { grand: true }),
    rowNum('10.', `PENGHASILAN TIDAK KENA PAJAK (PTKP)<br><span class="sp-xs">TK/${esc(st === 'KK' || st === 'HB' ? 'K' : '0')} — ${esc(calc.ptkp_detail?.uraian || '')}</span>`, calc.angka_10),
    rowNum('11.', 'PENGHASILAN KENA PAJAK (9 - 10)', calc.angka_11, { grand: true }),

    secHeader('C. PPh TERUTANG'),
    rowNum('12.', 'PPh TERUTANG (TARIF PASAL 17 UU PPh X ANGKA 11)<br><span class="sp-xs">[bagi WP status PH/MT diisi dari Lampiran Perhitungan PPh Terutang - bagian G huruf i]</span>', calc.angka_12),
    rowNum('13.', 'PENGEMBALIAN/PENGURANGAN PPh PASAL 24 YANG TELAH DIKREDITKAN', calc.pengembalian_pph_24),
    rowNum('14.', 'JUMLAH PPh TERUTANG (12 + 13)', calc.jumlah_pph_terutang, { grand: true }),

    secHeader('D. KREDIT PAJAK'),
    rowNum('15.', 'PPh YANG DIPOTONG / DIPUNGUT OLEH PIHAK LAIN, PPh YANG DIBAYAR / DIPOTONG DI LUAR NEGERI DAN PPh DITANGGUNG PEMERINTAH<br><span class="sp-xs">[dari 1770-II Jumlah Bagian A Kolom 7]</span>', calc.angka_15),
    rowAB('16.', 'PPh TERUTANG (14 - 15)', [
      { label: 'a. PPh YANG HARUS DIBAYAR SENDIRI', val: calc.angka_16, bold: true },
      { label: 'b. PPh YANG LEBIH DIPOTONG/DIPUNGUT', val: calc.pph_lebih_dipotong },
    ]),

    secHeader('E. PPh KURANG/LEBIH BAYAR'),
    rowAB('17.', 'PPh PASAL 25 BULANAN', [
      { label: 'a. PPh PASAL 25 BULANAN', val: calc.angka_17 },
      { label: 'b. STP PPh PASAL 25 (HANYA POKOK PAJAK)', val: calc.stp_pph_25 },
    ]),
    rowNum('18.', 'JUMLAH KREDIT PAJAK (17a + 17b)', calc.jumlah_kredit_pph_25, { grand: true }),
    rowAB('19.', 'PPh KURANG/LEBIH BAYAR (16 - 18)', [
      { label: 'a. PPh YANG KURANG DIBAYAR (PPh PASAL 29)', val: calc.angka_19a, bold: true },
      { label: 'b. PPh YANG LEBIH DIBAYAR (PPh PASAL 28A)', val: calc.angka_19b, bold: true },
    ]),
    `<tr>
      <td class="sp-num" style="width:8%">20.</td>
      <td class="sp-row-lbl">
        PERMOHONAN : PPh Lebih Bayar pada 19.b mohon
        <div class="sp-sm" style="margin-top:2px">
          ${checkBox(rest === 'DIRESTITUSIKAN' || rest === 'SKPPKP_17C' || rest === 'SKPPKP_17D')} DIKEMBALIKAN (RESTITUSI) &nbsp;&nbsp;
          ${checkBox(rest === 'KOMPENSASI')} DIPERHITUNGKAN DENGAN UTANG PAJAK (KOMPENSASI) &nbsp;&nbsp;
          ${checkBox(rest === 'SKPPKP_17C')} a. DIKEMBALIKAN DENGAN SKPPKP PASAL 17C (WP dengan Kriteria Tertentu)
        </div>
        <div class="sp-sm" style="margin-top:2px">
          ${checkBox(rest === 'SKPPKP_17D')} b. DIKEMBALIKAN DENGAN SKPPKP PASAL 17D (WP yang Memenuhi Persyaratan Tertentu)
        </div>
      </td>
      <td class="sp-cell-val"></td>
    </tr>`,

    secHeader('F. ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA'),
    `<tr class="sp-grandrow">
      <td class="sp-num" style="width:8%">21.</td>
      <td class="sp-row-lbl">ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA DIHITUNG SEBESAR<br>
        <span class="sp-xs">a. 1/12 x JUMLAH PADA ANGKA 16 &nbsp;&nbsp; ${checkBox(true)}</span><br>
        <span class="sp-xs">b. PERHITUNGAN WAJIB PAJAK ORANG PRIBADI PENGUSAHA TERTENTU &nbsp;&nbsp; ${checkBox(false)}</span><br>
        <span class="sp-xs">c. PERHITUNGAN DALAM LAMPIRAN TERSENDIRI &nbsp;&nbsp; ${checkBox(false)}</span>
      </td>
      <td class="sp-cell-val">${rp(calc.angka_21)}</td>
    </tr>`,

    secHeader('G. LAMPIRAN'),
    `<tr class="sp-lampiran-check"><td colspan="3">
      <span class="sp-bold">SELAIN FORMULIR 1770-I SAMPAI DENGAN 1770-IV (BAIK YANG DIISI MAUPUN YANG TIDAK DIISI) HARUS DILAMPIRKAN PULA:</span>
      <div style="margin-top:1px">
        a. SURAT KUASA KHUSUS (BILA DIKUASAKAN) ${checkBox(false)} &nbsp;
        b. SSP LEMBAR KE-3 PPh PASAL 29 ${checkBox(calc.angka_19a > 0)} &nbsp;
        c. PERHITUNGAN KOMPENSASI KERUGIAN FISKAL ${checkBox(calc.angka_8 > 0)} &nbsp;
        d. FOTOKOPI FORMULIR 1721-A1 DAN/ATAU 1721-A2 (&hellip; LEMBAR) ${checkBox(false)}<br>
        e. PERHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA ${checkBox(false)} &nbsp;
        f. PERHITUNGAN PPh TERUTANG BAGI WP DENGAN STATUS PERPAJAKAN PH ATAU MT ${checkBox(st === 'PH' || st === 'MT')} &nbsp;
        g. DAFTAR JUMLAH PEREDARAN BRUTO DAN PEMBAYARAN PPh FINAL PP 46/2013 ${checkBox(false)} &nbsp;
        h. DAFTAR JUMLAH PENGHASILAN DAN PEMBAYARAN PPh PASAL 25 (WP PENGUSAHA TERTENTU) ${checkBox(false)} &nbsp;
        i. NERACA & LAP. LABA RUGI / REKAPITULASI BULANAN PEREDARAN BRUTO ${checkBox(false)}
      </div>
    </td></tr>`,
  ]

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770',
      title: 'UNTUK WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN DARI USAHA/PEKERJAAN BEBAS; DARI SATU ATAU LEBIH PEMBERI KERJA; YANG DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL; DAN/ATAU DALAM NEGERI LAINNYA/LUAR NEGERI.',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
      pembetulan: ind.pembetulan_ke,
      extra: identitas1770(ind),
    })}
    <table class="sp-table sp-induk">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>URAIAN</th>
          <th style="width:24%">JUMLAH (Rupiah)</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>

    <div class="sp-note">*) Pengisian kolom-kolom yang berisi nilai rupiah harus tanpa nilai desimal (contoh penulisan lihat petunjuk pengisian halaman 3).</div>
    <div class="sp-note">Permohonan perubahan data disampaikan terpisah dari pelaporan SPT Tahunan PPh Orang Pribadi ini, dengan menggunakan Formulir Perubahan Data Wajib Pajak dan dilengkapi dokumen yang disyaratkan.</div>

    ${pernyataan(ind.nama)}
    ${footForm()}
  </div>`
}

/* ========================================================================
   FORMULIR INDUK 1770S
   ======================================================================== */

function induk1770S(data, calc) {
  const ind = data?.identitas || {}
  const permohonan = data?.permohonan || {}
  const rest = permohonan.restitusi || ''
  const st = statusKawinLabel(ind.status_kawin)

  const rows = [
    secHeader('A. PENGHASILAN NETO'),
    rowNum('1.', 'PENGHASILAN NETO DARI PEKERJAAN<br><span class="sp-xs">[akumulasi penghasilan neto pada Formulir 1721-A1/A2 atau Bukti Potong Lain]</span>', calc.angka_2),
    rowNum('2.', 'PENGHASILAN NETO DALAM NEGERI LAINNYA<br><span class="sp-xs">[dari 1770S-I Jumlah Bagian A]</span>', calc.angka_3),
    rowNum('3.', 'PENGHASILAN NETO LUAR NEGERI<br><span class="sp-xs">[isi dari Lampiran Tersendiri, lihat petunjuk pengisian]</span>', calc.angka_4),
    rowNum('4.', 'JUMLAH PENGHASILAN NETO (1 + 2 + 3)', calc.angka_5, { grand: true }),
    rowNum('5.', 'ZAKAT / SUMBANGAN KEAGAMAAN YANG SIFATNYA WAJIB', calc.angka_6),
    rowNum('6.', 'JUMLAH PENGHASILAN NETO SETELAH PENGURANGAN ZAKAT/SUMBANGAN KEAGAMAAN YANG SIFATNYA WAJIB (4 - 5)', calc.angka_7, { grand: true }),

    secHeader('B. PENGHASILAN KENA PAJAK'),
    rowNum('7.', `PENGHASILAN TIDAK KENA PAJAK (PTKP)<br><span class="sp-xs">TK/${esc(st === 'KK' || st === 'HB' ? 'K' : '0')} — ${esc(calc.ptkp_detail?.uraian || '')}</span>`, calc.angka_10),
    rowNum('8.', 'PENGHASILAN KENA PAJAK (6 - 7)', calc.angka_11, { grand: true }),

    secHeader('C. PPh TERUTANG'),
    rowNum('9.', 'PPh TERUTANG (TARIF PASAL 17 UU PPh x ANGKA 8)', calc.angka_12),
    rowNum('10.', 'PENGEMBALIAN / PENGURANGAN PPh PASAL 24 YANG TELAH DIKREDITKAN', calc.pengembalian_pph_24),
    rowNum('11.', 'JUMLAH PPh TERUTANG (9 + 10)', calc.jumlah_pph_terutang, { grand: true }),

    secHeader('D. KREDIT PAJAK'),
    rowNum('12.', 'PPh YANG DIPOTONG / DIPUNGUT OLEH PIHAK LAIN DALAM NEGERI DAN/ATAU TERUTANG DI LUAR NEGERI<br><span class="sp-xs">[dari 1770S-I Jumlah Bagian C Kolom (7)]</span>', calc.angka_15),
    rowAB('13.', 'PPh YANG HARUS DIBAYAR SENDIRI / LEBIH DIPOTONG (11 - 12)', [
      { label: 'a. PPh YANG HARUS DIBAYAR SENDIRI', val: calc.angka_16, bold: true },
      { label: 'b. PPh YANG LEBIH DIPOTONG/DIPUNGUT', val: calc.pph_lebih_dipotong },
    ]),
    rowAB('14.', 'PPh PASAL 25', [
      { label: 'a. PPh PASAL 25', val: calc.angka_17 },
      { label: 'b. STP PPh PASAL 25 (HANYA POKOK PAJAK)', val: calc.stp_pph_25 },
    ]),
    rowNum('15.', 'JUMLAH KREDIT PAJAK (14a + 14b)', calc.jumlah_kredit_pph_25, { grand: true }),
    rowAB('16.', 'PPh KURANG/LEBIH BAYAR (13a - 15)', [
      { label: 'a. PPh YANG KURANG DIBAYAR (PPh PASAL 29)', val: calc.angka_19a, bold: true },
      { label: 'b. PPh YANG LEBIH DIBAYAR (PPh PASAL 28A)', val: calc.angka_19b, bold: true },
    ]),
    `<tr>
      <td class="sp-num" style="width:8%">17.</td>
      <td class="sp-row-lbl">
        PERMOHONAN : PPh Lebih Bayar pada 16.b mohon
        <div class="sp-sm" style="margin-top:2px">
          ${checkBox(rest === 'DIRESTITUSIKAN' || rest === 'SKPPKP_17C' || rest === 'SKPPKP_17D')} a. DIRESTITUSIKAN &nbsp;&nbsp;
          ${checkBox(rest === 'KOMPENSASI')} b. DIPERHITUNGKAN DENGAN UTANG PAJAK
        </div>
        <div class="sp-sm" style="margin-top:2px">
          ${checkBox(rest === 'SKPPKP_17C')} c. DIKEMBALIKAN DENGAN SKPPKP PASAL 17C (WP dengan Kriteria Tertentu) &nbsp;&nbsp;
          ${checkBox(rest === 'SKPPKP_17D')} d. DIKEMBALIKAN DENGAN SKPPKP PASAL 17D (WP yang Memenuhi Persyaratan Tertentu)
        </div>
      </td>
      <td class="sp-cell-val"></td>
    </tr>`,
    secHeader('F. ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA'),
    `<tr class="sp-grandrow">
      <td class="sp-num" style="width:8%">18.</td>
      <td class="sp-row-lbl">ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA SEBESAR DIHITUNG BERDASARKAN:<br>
        <span class="sp-xs">a. 1/12 x JUMLAH PADA ANGKA 13 &nbsp;&nbsp; ${checkBox(true)}</span><br>
        <span class="sp-xs">b. PERHITUNGAN DALAM LAMPIRAN TERSENDIRI &nbsp;&nbsp; ${checkBox(false)}</span>
      </td>
      <td class="sp-cell-val">${rp(calc.angka_21)}</td>
    </tr>`,

    secHeader('G. LAMPIRAN'),
    `<tr class="sp-lampiran-check"><td colspan="3">
      <div style="margin-top:1px">
        a. FOTOKOPI FORMULIR 1721-A1 DAN/ATAU 1721-A2 ATAU BUKTI PEMOTONGAN PPh PASAL 21 (&hellip; LEMBAR) ${checkBox(true)} &nbsp;
        b. SSP LEMBAR KE-3 PPh PASAL 29 ${checkBox((calc.angka_19a || 0) > 0)} &nbsp;
        c. SURAT KUASA KHUSUS (BILA DIKUASAKAN) ${checkBox(false)}
      </div>
      <div style="margin-top:1px">
        d. &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; ${checkBox(false)} &nbsp;
        e. &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; ${checkBox(false)}
      </div>
    </td></tr>`,
  ]

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 S',
      title: 'UNTUK WAJIB PAJAK YANG MEMPUNYAI PENGHASILAN: DARI SATU ATAU LEBIH PEMBERI KERJA; DALAM NEGERI LAINNYA; DAN/ATAU YANG DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL.',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
      pembetulan: ind.pembetulan_ke,
      extra: identitas1770S(ind),
    })}
    <table class="sp-table sp-induk">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>URAIAN</th>
          <th style="width:24%">JUMLAH (Rupiah)</th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>

    <div class="sp-note">*) Pengisian kolom-kolom yang berisi nilai rupiah harus tanpa nilai desimal (contoh penulisan lihat petunjuk pengisian halaman 3).</div>

    ${pernyataan(ind.nama)}
    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN I (1770) — usaha / pekerjaan bebas
   ======================================================================== */

function lampiranI1770(data, calc) {
  const ind = data?.identitas || {}
  const ph = data?.penghasilan || {}
  const usaha = ph.usaha || {}
  const metode = ph.metode || 'pembukuan'
  const metodeText = metode === 'pencatatan' ? 'PENCATATAN' : 'PEMBUKUAN'

  // Bagian A (pembukuan)
  let bagianA
  if (metode === 'pembukuan') {
    const pos = usaha.penyesuaian_positif || {}
    const posKeys = Object.keys(pos).filter(k => pos[k])
    const posRows = posKeys.length
      ? posKeys.map(k => `<tr><td class="sp-num"></td><td>${esc(k)}</td><td class="sp-cell-val">${rp(pos[k])}</td></tr>`).join('')
      : ''
    const neg = usaha.penyesuaian_negatif || {}
    const negKeys = Object.keys(neg).filter(k => neg[k])
    const negRows = negKeys.length
      ? negKeys.map(k => `<tr><td class="sp-num"></td><td>${esc(k)}</td><td class="sp-cell-val">${rp(neg[k])}</td></tr>`).join('')
      : ''
    bagianA = `
      <tr><td class="sp-num">1a.</td><td>PEREDARAN USAHA</td><td class="sp-cell-val">${rp(usaha.peredaran_usaha)}</td></tr>
      <tr><td class="sp-num">1b.</td><td>HARGA POKOK PENJUALAN</td><td class="sp-cell-val">${rp(usaha.hpp)}</td></tr>
      <tr><td class="sp-num">1c.</td><td>LABA/RUGI BRUTO USAHA (1a - 1b)</td><td class="sp-cell-val">${rp(usaha.laba_rugi_bruto)}</td></tr>
      <tr><td class="sp-num">1d.</td><td>BIAYA USAHA</td><td class="sp-cell-val">${rp(usaha.biaya_usaha)}</td></tr>
      <tr><td class="sp-num">1e.</td><td>PENGHASILAN NETO (1c - 1d)</td><td class="sp-cell-val">${rp(usaha.penghasilan_neto_komersial)}</td></tr>
      <tr><td class="sp-num" style="font-weight:bold">2.</td><td style="font-weight:bold">PENYESUAIAN FISKAL POSITIF</td><td></td></tr>
      ${posRows}
      <tr class="sp-grandrow"><td class="sp-num">2l.</td><td>JUMLAH (2a s.d. 2k)</td><td class="sp-cell-val">${rp(usaha.jumlah_penyesuaian_positif)}</td></tr>
      <tr><td class="sp-num" style="font-weight:bold">3.</td><td style="font-weight:bold">PENYESUAIAN FISKAL NEGATIF</td><td></td></tr>
      ${negRows}
      <tr class="sp-grandrow"><td class="sp-num">3d.</td><td>JUMLAH (3a s.d. 3c)</td><td class="sp-cell-val">${rp(usaha.jumlah_penyesuaian_negatif)}</td></tr>
      <tr class="sp-grandrow"><td class="sp-num">4.</td><td>JUMLAH BAGIAN A (1e + 2l - 3d)</td><td class="sp-cell-val">${rp(calc.angka_1)}</td></tr>`
  } else {
    const catat = ph.usaha_pencatatan || {}
    bagianA = `
      <tr><td class="sp-num" colspan="3" class="sp-center">BAGI WAJIB PAJAK YANG MENYELENGGARAKAN PENCATATAN</td></tr>
      <tr><td class="sp-num">1</td><td>JENIS USAHA : ${esc(catat.jenis_usaha)}</td><td></td></tr>
      <tr><td class="sp-num">2</td><td>NORMA PENGHITUNGAN PENGHASILAN NETO (%)</td><td class="sp-cell-val">${formatAngka(catat.norma_persen)}%</td></tr>
      <tr><td class="sp-num">3</td><td>PEREDARAN USAHA</td><td class="sp-cell-val">${rp(catat.peredaran_usaha)}</td></tr>
      <tr class="sp-grandrow"><td class="sp-num">4</td><td>JUMLAH PENGHASILAN NETO (2 x 3)</td><td class="sp-cell-val">${rp(calc.angka_1)}</td></tr>`
  }

  // Bagian C: pekerjaan
  const pekerjaan = ph.pekerjaan || []
  const barisPekerjaan = pekerjaan.length
    ? pekerjaan.map((p, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(p.nama_pemberi_kerja)}<br><span class="sp-xs">NPWP : ${esc(p.npwp_pemberi_kerja || '-')}</span></td>
        <td class="sp-cell-val">${rp(p.penghasilan_neto)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td></tr>`

  // Bagian D: dalam negeri lainnya
  const lainnya = ph.dalam_negeri_lainnya || []
  const barisLainnya = lainnya.length
    ? lainnya.map((d, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(d.jenis || 'Penghasilan lainnya')}<br><span class="sp-xs">Penghasilan bruto : ${rp(d.penghasilan_bruto)}</span></td>
        <td class="sp-cell-val">${rp(d.penghasilan_neto)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td></tr>`

  // Bagian E: luar negeri
  const ln = Number(ph.luar_negeri || 0)

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 - I',
      title: 'LAMPIRAN - I &nbsp;·&nbsp; HALAMAN 1',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}
    <div class="sp-sm sp-bold">PENGHITUNGAN PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS</div>
    <div class="sp-sm">Metode pembukuan: ${checkBox(metode === 'pembukuan')} PEMBUKUAN &nbsp;&nbsp; ${checkBox(metode === 'pencatatan')} PENCATATAN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th colspan="3">BAGIAN A : PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS (BAGI WAJIB PAJAK YANG MENYELENGGARAKAN PEMBUKUAN)</th>
        </tr>
        <tr>
          <th style="width:8%">NO.</th>
          <th>URAIAN</th>
          <th style="width:24%">JUMLAH (Rupiah)</th>
        </tr>
      </thead>
      <tbody>${bagianA}</tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian A (angka 4) ke Formulir 1770 Angka 1.</div>
    <div class="sp-note">*) Metode PENCATATAN (Norma Penghitungan Penghasilan Neto) hanya diperbolehkan bagi WP OP yang peredaran brutonya kurang dari Rp4,8 miliar setahun.</div>
    ${footForm()}
  </div>

  <div class="sp-page">
    ${headerForm({
      code: '1770 - I',
      title: 'LAMPIRAN - I &nbsp;·&nbsp; HALAMAN 2',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}
    ${metode === 'pencatatan' ? `
    <div class="sp-sm sp-bold">BAGIAN B : PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS (BAGI WAJIB PAJAK YANG MENYELENGGARAKAN PENCATATAN)</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>JENIS USAHA</th>
          <th style="width:14%">NORMA (%)</th>
          <th style="width:20%">PEREDARAN USAHA (Rp)</th>
          <th style="width:20%">PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="sp-num">1</td>
          <td>${esc((ph.usaha_pencatatan || {}).jenis_usaha || '-')}</td>
          <td class="sp-cell-val">${formatAngka((ph.usaha_pencatatan || {}).norma_persen)}%</td>
          <td class="sp-cell-val">${rp((ph.usaha_pencatatan || {}).peredaran_usaha)}</td>
          <td class="sp-cell-val">${rp(calc.angka_1)}</td>
        </tr>
        <tr class="sp-grandrow"><td class="sp-num"></td><td colspan="3">JUMLAH BAGIAN B</td><td class="sp-cell-val">${rp(calc.angka_1)}</td></tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian B Kolom (5) ke Formulir 1770 Angka 1.</div>` : ''}

    <div class="sp-sm sp-bold" style="margin-top:${metode === 'pencatatan' ? '3mm' : '0'}">BAGIAN C : PENGHASILAN NETO DALAM NEGERI SEHUBUNGAN DENGAN PEKERJAAN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>NAMA DAN NPWP PEMBERI KERJA</th>
          <th style="width:24%">PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>${barisPekerjaan}
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN C</td><td class="sp-cell-val">${rp(calc.angka_2)}</td></tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian C Kolom (5) ke Formulir 1770 Angka 2.</div>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN D : PENGHASILAN NETO DALAM NEGERI LAINNYA</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:24%">PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>${barisLainnya}
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN D</td><td class="sp-cell-val">${rp(calc.angka_3)}</td></tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian D ke Formulir 1770 Angka 3.</div>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN E : PENGHASILAN NETO LUAR NEGERI</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:24%">PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="sp-num">1</td><td>Penghasilan neto dari luar negeri (setelah pajak yang dibayar/dipotong di luar negeri)</td><td class="sp-cell-val">${rp(ln)}</td></tr>
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN E</td><td class="sp-cell-val">${rp(ln)}</td></tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian E ke Formulir 1770 Angka 4.</div>
    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN II (1770) — daftar pemotongan/pemungutan PPh
   ======================================================================== */

function lampiranII1770(data, calc) {
  const ind = data?.identitas || {}
  const kredit = data?.kredit_pajak || {}
  const pemotongan = kredit.pemotongan || []

  const rows = pemotongan.length
    ? pemotongan.map((p, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(p.nama || '-')}</td>
        <td>${esc(p.npwp || '-')}</td>
        <td>${esc(p.no_bukti || '-')}</td>
        <td>${esc(p.tanggal || '-')}</td>
        <td class="sp-num">${esc(p.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(p.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="sp-center">Tidak ada bukti pemotongan/pemungutan</td></tr>`

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 - II',
      title: 'LAMPIRAN - II',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}
    <div class="sp-sm sp-bold">BAGIAN A : DAFTAR PEMOTONGAN/PEMUNGUTAN PPh OLEH PIHAK LAIN, PPh YANG DIBAYAR/DIPOTONG DI LUAR NEGERI DAN PPh DITANGGUNG PEMERINTAH</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:20%">NAMA PEMOTONG/PEMUNGUT PAJAK</th>
          <th style="width:16%">NPWP PEMOTONG/PEMUNGUT PAJAK</th>
          <th style="width:13%">BUKTI PEMOTONGAN/PEMUNGUTAN</th>
          <th style="width:9%">TANGGAL</th>
          <th style="width:8%">JENIS PAJAK : PPh PASAL 21/22/23/24/26/DTP</th>
          <th style="width:17%">JUMLAH PPh YANG DIPOTONG/DIPUNGUT (Rp)</th>
        </tr>
      </thead>
      <tbody>${rows}
        <tr class="sp-grandrow">
          <td colspan="6" class="sp-right">JUMLAH BAGIAN A</td>
          <td class="sp-cell-val">${rp(calc.angka_15)}</td>
        </tr>
      </tbody>
    </table>
    <div class="sp-note">*) - Pindahkan Jumlah Bagian A Kolom 7 ke Formulir 1770 Angka 15.</div>
    <div class="sp-note">*) - Kolom JENIS PAJAK diisi dengan pilihan 21 / 22 / 23 / 24 / 26 / DTP (Contoh : ditulis 21, 22, 23, 24, 26, DTP).</div>
    <div class="sp-note">*) - Jika terdapat kredit pajak PPh Pasal 24, maka jumlah yang diisi adalah maksimum yang dapat dikreditkan sesuai lampiran tersendiri (lihat petunjuk pengisian tentang Lampiran II Bagian A dan Induk SPT angka 4).</div>
    <div class="sp-note">*) - DTP : Ditanggung Pemerintah.</div>
    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN III (1770) — PPh final & bukan objek
   ======================================================================== */

function lampiranIII1770(data, calc) {
  const ind = data?.identitas || {}
  const ph = data?.penghasilan || {}
  const final = ph.final || []
  const bukanObjek = ph.bukan_objek || []

  const rowsFinal = final.length
    ? final.map((f, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(f.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(f.dasar_pengenaan)}</td>
        <td class="sp-cell-val">${rp(f.pph_terutang)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td><td></td></tr>`

  const rowsBukan = bukanObjek.length
    ? bukanObjek.map((b, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(b.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(b.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td></tr>`

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 - III',
      title: 'LAMPIRAN - III',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}
    <div class="sp-sm sp-bold">BAGIAN A : PENGHASILAN YANG DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:6%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:22%">DASAR PENGENAAN PAJAK/PENGHASILAN BRUTO (Rp)</th>
          <th style="width:22%">PPh TERUTANG (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsFinal}</tbody>
    </table>
    <div class="sp-note">Penghasilan yang dikenakan PPh final bersifat final dilaporkan di bagian ini dan TIDAK digabungkan ke penghasilan neto pada Formulir Induk.</div>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN B : PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:24%">JUMLAH (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsBukan}</tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN C : PENGHASILAN ISTERI/SUAMI YANG DIKENAKAN PAJAK SECARA TERPISAH</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>SUMBER/JENIS PENGHASILAN</th>
          <th style="width:24%">PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="sp-num">1</td><td>PENGHASILAN ISTERI DARI SATU PEMBERI KERJA</td><td class="sp-cell-val">0</td></tr>
      </tbody>
    </table>
    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN IV (1770) — harta, utang, tanggungan
   ======================================================================== */

function lampiranIV1770(data, calc) {
  const ind = data?.identitas || {}
  const harta = data?.harta || []
  const utang = data?.utang || []
  const tanggungan = data?.tanggungan || []

  const rowsHarta = harta.length
    ? harta.map((h, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td class="sp-num">${esc(h.kode || '-')}</td>
        <td>${esc(h.nama || '-')}</td>
        <td class="sp-num">${esc(h.tahun_perolehan || '-')}</td>
        <td class="sp-cell-val">${rp(h.harga_perolehan)}</td>
        <td class="sp-xs">${esc(h.keterangan || '')}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="sp-center">Tidak ada harta</td></tr>`

  const totalHarta = harta.reduce((s, h) => s + (Number(h.harga_perolehan) || 0), 0)

  const rowsUtang = utang.length
    ? utang.map((u, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td class="sp-num">${esc(u.kode || '-')}</td>
        <td>${esc(u.nama_pemberi || '-')}</td>
        <td class="sp-xs">${esc(u.alamat_pemberi || '')}</td>
        <td class="sp-num">${esc(u.tahun_peminjaman || '-')}</td>
        <td class="sp-cell-val">${rp(u.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="sp-center">Tidak ada utang</td></tr>`

  const totalUtang = utang.reduce((s, u) => s + (Number(u.jumlah) || 0), 0)

  const rowsTanggungan = tanggungan.length
    ? tanggungan.map((t, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(t.nama || '-')}</td>
        <td>${esc(t.nik || '-')}</td>
        <td>${esc(t.hubungan || '-')}</td>
        <td>${esc(t.pekerjaan || '-')}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" class="sp-center">Tidak ada tanggungan</td></tr>`

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 - IV',
      title: 'LAMPIRAN - IV',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}

    <div class="sp-sm sp-bold">BAGIAN A : HARTA PADA AKHIR TAHUN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:8%">KODE HARTA</th>
          <th style="width:30%">NAMA HARTA</th>
          <th style="width:10%">TAHUN PEROLEHAN</th>
          <th style="width:20%">HARGA PEROLEHAN (Rp)</th>
          <th style="width:27%">KETERANGAN</th>
        </tr>
      </thead>
      <tbody>${rowsHarta}
        <tr class="sp-grandrow"><td colspan="4" class="sp-right">JUMLAH BAGIAN A</td><td class="sp-cell-val">${rp(totalHarta)}</td><td></td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN B : KEWAJIBAN/UTANG PADA AKHIR TAHUN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:8%">KODE UTANG</th>
          <th style="width:24%">NAMA PEMBERI PINJAMAN</th>
          <th style="width:26%">ALAMAT PEMBERI PINJAMAN</th>
          <th style="width:10%">TAHUN PEMINJAMAN</th>
          <th style="width:16%">JUMLAH (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsUtang}
        <tr class="sp-grandrow"><td colspan="5" class="sp-right">JUMLAH BAGIAN B</td><td class="sp-cell-val">${rp(totalUtang)}</td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN C : DAFTAR SUSUNAN ANGGOTA KELUARGA</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:32%">NAMA ANGGOTA KELUARGA</th>
          <th style="width:22%">NIK</th>
          <th style="width:20%">HUBUNGAN KELUARGA</th>
          <th style="width:21%">PEKERJAAN</th>
        </tr>
      </thead>
      <tbody>${rowsTanggungan}</tbody>
    </table>

    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN 1770S - I (penghasilan lainnya, bukan objek, pemotongan)
   ======================================================================== */

function lampiranS_I(data, calc) {
  const ind = data?.identitas || {}
  const ph = data?.penghasilan || {}
  const kredit = data?.kredit_pajak || {}
  const lainnya = ph.dalam_negeri_lainnya || []
  const bukanObjek = ph.bukan_objek || []
  const pemotongan = kredit.pemotongan || []

  const rowsLainnya = lainnya.length
    ? lainnya.map((d, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(d.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(d.penghasilan_bruto)}</td>
        <td class="sp-cell-val">${rp(d.penghasilan_neto)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td><td></td></tr>`

  const totalBrutoLainnya = lainnya.reduce((s, d) => s + (Number(d.penghasilan_bruto) || 0), 0)

  const rowsBukan = bukanObjek.length
    ? bukanObjek.map((b, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(b.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(b.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td></tr>`

  const rowsPemotongan = pemotongan.length
    ? pemotongan.map((p, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(p.nama || '-')}</td>
        <td>${esc(p.npwp || '-')}</td>
        <td>${esc(p.no_bukti || '-')}</td>
        <td>${esc(p.tanggal || '-')}</td>
        <td class="sp-num">${esc(p.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(p.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="sp-center">Tidak ada bukti pemotongan/pemungutan</td></tr>`

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 S - I',
      title: 'LAMPIRAN - I',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}

    <div class="sp-sm sp-bold">BAGIAN A : PENGHASILAN NETO DALAM NEGERI LAINNYA (TIDAK TERMASUK PENGHASILAN DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL)</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:6%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:20%">JUMLAH PENGHASILAN BRUTO (Rp)</th>
          <th style="width:20%">JUMLAH PENGHASILAN NETO (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsLainnya}
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN A</td><td class="sp-cell-val">${rp(totalBrutoLainnya)}</td><td class="sp-cell-val">${rp(calc.angka_3)}</td></tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian A ke Formulir Induk 1770 S Bagian A angka 2.</div>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN B : PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:8%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:24%">JUMLAH (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsBukan}
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN B</td><td class="sp-cell-val">${rp(bukanObjek.reduce((s, b) => s + (Number(b.jumlah) || 0), 0))}</td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN C : DAFTAR PEMOTONGAN/PEMUNGUTAN PPh OLEH PIHAK LAIN DAN PPh YANG DITANGGUNG PEMERINTAH</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:19%">NAMA PEMOTONG/PEMUNGUT PAJAK</th>
          <th style="width:15%">NPWP PEMOTONG/PEMUNGUT PAJAK</th>
          <th style="width:12%">NOMOR BUKTI PEMOTONGAN/PEMUNGUTAN</th>
          <th style="width:8%">TANGGAL</th>
          <th style="width:8%">JENIS PAJAK : PPh 21/22/23/24/26/DTP</th>
          <th style="width:16%">JUMLAH PPh YANG DIPOTONG/DIPUNGUT (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsPemotongan}
        <tr class="sp-grandrow">
          <td colspan="6" class="sp-right">JUMLAH BAGIAN C</td>
          <td class="sp-cell-val">${rp(calc.angka_15)}</td>
        </tr>
      </tbody>
    </table>
    <div class="sp-note">Pindahkan Jumlah Bagian C ke Formulir Induk 1770 S Bagian D angka 12.</div>
    <div class="sp-note">*) - DTP : Ditanggung Pemerintah. Kolom diisi dengan pilihan PPh Pasal 21/22/23/24/26/DTP. Jika terdapat kredit pajak PPh Pasal 24, maka jumlah yang diisi adalah maksimum yang dapat dikreditkan sesuai lampiran tersendiri.</div>
    ${footForm()}
  </div>`
}

/* ========================================================================
   LAMPIRAN 1770S - II (PPh final, harta, utang, tanggungan)
   ======================================================================== */

function lampiranS_II(data, calc) {
  const ind = data?.identitas || {}
  const ph = data?.penghasilan || {}
  const final = ph.final || []
  const harta = data?.harta || []
  const utang = data?.utang || []
  const tanggungan = data?.tanggungan || []

  const rowsFinal = final.length
    ? final.map((f, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(f.jenis || '-')}</td>
        <td class="sp-cell-val">${rp(f.dasar_pengenaan)}</td>
        <td class="sp-cell-val">${rp(f.pph_terutang)}</td>
      </tr>`).join('')
    : `<tr><td class="sp-num">-</td><td>Tidak ada</td><td></td><td></td></tr>`

  const totalDasarFinal = final.reduce((s, f) => s + (Number(f.dasar_pengenaan) || 0), 0)
  const totalPPhFinal = final.reduce((s, f) => s + (Number(f.pph_terutang) || 0), 0)

  const rowsHarta = harta.length
    ? harta.map((h, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td class="sp-num">${esc(h.kode || '-')}</td>
        <td>${esc(h.nama || '-')}</td>
        <td class="sp-num">${esc(h.tahun_perolehan || '-')}</td>
        <td class="sp-cell-val">${rp(h.harga_perolehan)}</td>
        <td class="sp-xs">${esc(h.keterangan || '')}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="sp-center">Tidak ada harta</td></tr>`

  const totalHarta = harta.reduce((s, h) => s + (Number(h.harga_perolehan) || 0), 0)

  const rowsUtang = utang.length
    ? utang.map((u, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td class="sp-num">${esc(u.kode || '-')}</td>
        <td>${esc(u.nama_pemberi || '-')}</td>
        <td class="sp-xs">${esc(u.alamat_pemberi || '')}</td>
        <td class="sp-num">${esc(u.tahun_peminjaman || '-')}</td>
        <td class="sp-cell-val">${rp(u.jumlah)}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="sp-center">Tidak ada utang</td></tr>`

  const totalUtang = utang.reduce((s, u) => s + (Number(u.jumlah) || 0), 0)

  const rowsTanggungan = tanggungan.length
    ? tanggungan.map((t, i) => `
      <tr>
        <td class="sp-num">${i + 1}</td>
        <td>${esc(t.nama || '-')}</td>
        <td>${esc(t.nik || '-')}</td>
        <td>${esc(t.hubungan || '-')}</td>
        <td>${esc(t.pekerjaan || '-')}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" class="sp-center">Tidak ada tanggungan</td></tr>`

  return `
  <div class="sp-page">
    ${headerForm({
      code: '1770 S - II',
      title: 'LAMPIRAN - II',
      tahunPajak: ind.tahun_pajak,
      npwp: ind.npwp,
      nama: ind.nama,
    })}

    <div class="sp-sm sp-bold">BAGIAN A : PENGHASILAN YANG DIKENAKAN PPh FINAL DAN/ATAU BERSIFAT FINAL</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:6%">NO.</th>
          <th>JENIS PENGHASILAN</th>
          <th style="width:22%">DASAR PENGENAAN PAJAK/PENGHASILAN BRUTO (Rp)</th>
          <th style="width:22%">PPh TERUTANG (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsFinal}
        <tr class="sp-grandrow"><td class="sp-num"></td><td>JUMLAH BAGIAN A</td><td class="sp-cell-val">${rp(totalDasarFinal)}</td><td class="sp-cell-val">${rp(totalPPhFinal)}</td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN B : HARTA PADA AKHIR TAHUN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:8%">KODE</th>
          <th style="width:30%">NAMA HARTA</th>
          <th style="width:10%">TAHUN PEROLEHAN</th>
          <th style="width:20%">HARGA PEROLEHAN (Rp)</th>
          <th style="width:27%">KETERANGAN</th>
        </tr>
      </thead>
      <tbody>${rowsHarta}
        <tr class="sp-grandrow"><td colspan="4" class="sp-right">JUMLAH BAGIAN B</td><td class="sp-cell-val">${rp(totalHarta)}</td><td></td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN C : KEWAJIBAN/UTANG PADA AKHIR TAHUN</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:8%">KODE</th>
          <th style="width:24%">NAMA PEMBERI PINJAMAN</th>
          <th style="width:26%">ALAMAT PEMBERI PINJAMAN</th>
          <th style="width:10%">TAHUN PEMINJAMAN</th>
          <th style="width:16%">JUMLAH (Rp)</th>
        </tr>
      </thead>
      <tbody>${rowsUtang}
        <tr class="sp-grandrow"><td colspan="5" class="sp-right">JUMLAH BAGIAN C</td><td class="sp-cell-val">${rp(totalUtang)}</td></tr>
      </tbody>
    </table>

    <div class="sp-sm sp-bold" style="margin-top:3mm">BAGIAN D : DAFTAR SUSUNAN ANGGOTA KELUARGA</div>
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:5%">NO.</th>
          <th style="width:32%">NAMA ANGGOTA KELUARGA</th>
          <th style="width:22%">NIK</th>
          <th style="width:20%">HUBUNGAN KELUARGA</th>
          <th style="width:21%">PEKERJAAN</th>
        </tr>
      </thead>
      <tbody>${rowsTanggungan}</tbody>
    </table>

    ${footForm()}
  </div>`
}

/* ========================================================================
   Entry point
   ======================================================================== */

export function buildSptPrintHtml(data, calc, formType) {
  if (!data || !calc) return ''

  let pages = ''
  if (formType === '1770S') {
    pages = [
      induk1770S(data, calc),
      lampiranS_I(data, calc),
      lampiranS_II(data, calc),
    ].join('\n')
  } else {
    pages = [
      induk1770(data, calc),
      lampiranI1770(data, calc),
      lampiranII1770(data, calc),
      lampiranIII1770(data, calc),
      lampiranIV1770(data, calc),
    ].join('\n')
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>SPT Tahunan ${formType} - Tahun ${calc.tahun_pajak || ''}</title>
  <style>${SPT_CSS}</style>
</head>
<body>
  ${pages}
</body>
</html>`
}
