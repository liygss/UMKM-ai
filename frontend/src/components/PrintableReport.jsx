import { forwardRef } from 'react'

function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTanggalCetak() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatRupiahCetak(val) {
  if (val === undefined || val === null) return '-'
  const abs = Math.abs(val)
  const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(abs)
  if (val < 0) return `(${formatted})`
  return formatted
}

function ReportHeader({ user, title, date }) {
  return (
    <div className="rpt-header">
      <div className="rpt-header-top">
        <div className="rpt-header-left">
          <div className="rpt-logo">
            <img src="/logo.png" alt="AI UMKM" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
          </div>
          <div>
            <h1 className="rpt-company">{user?.company_name || 'Nama Perusahaan'}</h1>
            {user?.email && <p className="rpt-email">{user.email}</p>}
          </div>
        </div>
        <div className="rpt-header-right">
          <div className="rpt-badge">AI UMKM</div>
        </div>
      </div>
      <div className="rpt-divider" />
      <div className="rpt-header-bottom">
        <div>
          <h2 className="rpt-title">{title}</h2>
          <p className="rpt-subtitle">Per {formatTanggalIndo(date)}</p>
        </div>
        <div className="rpt-meta">
          <span className="rpt-meta-label">Dicetak</span>
          <span className="rpt-meta-value">{formatTanggalCetak()}</span>
        </div>
      </div>
    </div>
  )
}

function ReportFooter() {
  return (
    <div className="rpt-footer">
      <div className="rpt-footer-line" />
      <div className="rpt-footer-content">
        <span className="rpt-footer-text">Dibuat oleh AI UMKM - Sistem Akuntansi Cerdas</span>
        <span className="rpt-footer-text">{formatTanggalCetak()}</span>
      </div>
    </div>
  )
}

function StatusBadge({ isBalance }) {
  return (
    <span className={`rpt-status ${isBalance ? 'rpt-status-ok' : 'rpt-status-err'}`}>
      <span className={`rpt-status-dot ${isBalance ? 'rpt-dot-ok' : 'rpt-dot-err'}`} />
      {isBalance ? 'SALDO SEIMBANG' : 'TIDAK SEIMBANG'}
    </span>
  )
}

function NeracaSaldoView({ data, user, date }) {
  if (!data) return null
  return (
    <div className="rpt-page">
      <ReportHeader user={user} title="LAPORAN NERACA SALDO" date={date} />
      <table className="rpt-table">
        <thead>
          <tr>
            <th style={{ width: '12%' }}>Kode</th>
            <th style={{ width: '35%' }}>Nama Akun</th>
            <th style={{ width: '18%' }}>Kategori</th>
            <th style={{ width: '17%' }} className="rpt-right">Debit</th>
            <th style={{ width: '18%' }} className="rpt-right">Kredit</th>
          </tr>
        </thead>
        <tbody>
          {(data.baris || []).map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td><span className="rpt-kategori">{r.kategori}</span></td>
              <td className="rpt-right rpt-mono">{r.debit > 0 ? formatRupiahCetak(r.debit) : '\u2014'}</td>
              <td className="rpt-right rpt-mono">{r.kredit > 0 ? formatRupiahCetak(r.kredit) : '\u2014'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="rpt-total-row">
            <td colSpan={3}>TOTAL</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_debit)}</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_kredit)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="rpt-status-line">
        Status: <StatusBadge isBalance={data.is_balance} />
      </div>
      <ReportFooter />
    </div>
  )
}

function LabaRugiView({ data, user, date }) {
  if (!data) return null
  return (
    <div className="rpt-page">
      <ReportHeader user={user} title="LAPORAN LABA RUGI" date={date} />
      <table className="rpt-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Kode</th>
            <th style={{ width: '55%' }}>Uraian</th>
            <th style={{ width: '30%' }} className="rpt-right">Nilai (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">1</span>
              PENDAPATAN
            </td>
          </tr>
          {(data.pendapatan || []).map((r, i) => (
            <tr key={`p-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total Pendapatan</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_pendapatan)}</td>
          </tr>

          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">2</span>
              HARGA POKOK PENJUALAN (HPP)
            </td>
          </tr>
          {(data.hpp || []).map((r, i) => (
            <tr key={`h-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total HPP</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_hpp)}</td>
          </tr>

          <tr className="rpt-grand-row">
            <td colSpan={2}>LABA KOTOR</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.laba_kotor)}</td>
          </tr>

          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">3</span>
              BEBAN OPERASIONAL
            </td>
          </tr>
          {(data.beban_operasional || []).map((r, i) => (
            <tr key={`b-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total Beban Operasional</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_beban_operasional)}</td>
          </tr>

          <tr className="rpt-final-row">
            <td colSpan={2}>LABA BERSIH</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.laba_bersih)}</td>
          </tr>
        </tbody>
      </table>
      <ReportFooter />
    </div>
  )
}

function PosisiKeuanganView({ data, user, date }) {
  if (!data) return null
  return (
    <div className="rpt-page">
      <ReportHeader user={user} title="LAPORAN POSISI KEUANGAN" date={date} />
      <table className="rpt-table">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Kode</th>
            <th style={{ width: '55%' }}>Uraian</th>
            <th style={{ width: '30%' }} className="rpt-right">Nilai (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">1</span>
              ASET
            </td>
          </tr>
          {(data.aset || []).map((r, i) => (
            <tr key={`a-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total Aset</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_aset)}</td>
          </tr>

          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">2</span>
              LIABILITAS
            </td>
          </tr>
          {(data.liabilitas || []).map((r, i) => (
            <tr key={`l-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total Liabilitas</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_liabilitas)}</td>
          </tr>

          <tr className="rpt-section">
            <td colSpan={3}>
              <span className="rpt-section-num">3</span>
              MODAL
            </td>
          </tr>
          {(data.modal || []).map((r, i) => (
            <tr key={`m-${i}`} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
              <td className="rpt-mono">{r.kode_akun}</td>
              <td className="rpt-name">{r.nama_akun}</td>
              <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
            </tr>
          ))}
          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Total Modal</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_modal)}</td>
          </tr>

          <tr className="rpt-subtotal-row">
            <td colSpan={2}>Laba/Rugi Berjalan</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.laba_rugi_berjalan)}</td>
          </tr>

          <tr className="rpt-final-row">
            <td colSpan={2}>TOTAL LIABILITAS DAN MODAL</td>
            <td className="rpt-right rpt-mono">{formatRupiahCetak(data.total_liabilitas_dan_modal)}</td>
          </tr>
        </tbody>
      </table>
      <div className="rpt-status-line">
        Status: <StatusBadge isBalance={data.is_balance} />
      </div>
      <ReportFooter />
    </div>
  )
}

function CalkView({ data, user, date }) {
  if (!data) return null
  const sections = []
  if (data.kebijakan_akuntansi?.length > 0) sections.push({ num: 1, title: 'Kebijakan Akuntansi', type: 'list', items: data.kebijakan_akuntansi })
  if (data.rincian_aset?.length > 0) sections.push({ num: sections.length + 1, title: 'Rincian Aset', type: 'table', items: data.rincian_aset })
  if (data.rincian_liabilitas?.length > 0) sections.push({ num: sections.length + 1, title: 'Rincian Liabilitas', type: 'table', items: data.rincian_liabilitas })
  if (data.rincian_pendapatan?.length > 0) sections.push({ num: sections.length + 1, title: 'Rincian Pendapatan', type: 'table', items: data.rincian_pendapatan })
  if (data.rincian_beban?.length > 0) sections.push({ num: sections.length + 1, title: 'Rincian Beban', type: 'table', items: data.rincian_beban })
  if (data.catatan_tambahan?.length > 0) sections.push({ num: sections.length + 1, title: 'Catatan Tambahan', type: 'list', items: data.catatan_tambahan })

  return (
    <div className="rpt-page">
      <ReportHeader user={user} title="CATATAN ATAS LAPORAN KEUANGAN (CALK)" date={date} />
      {sections.map((sec) => (
        <div key={sec.num} className="rpt-section-block">
          <h3 className="rpt-section-title">
            <span className="rpt-section-num">{sec.num}</span>
            {sec.title}
          </h3>
          {sec.type === 'list' ? (
            <ol className="rpt-list">
              {sec.items.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <table className="rpt-table rpt-compact">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Kode</th>
                  <th style={{ width: '38%' }}>Nama Akun</th>
                  <th style={{ width: '30%' }}>Catatan</th>
                  <th style={{ width: '20%' }} className="rpt-right">Nilai (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {sec.items.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'rpt-even' : 'rpt-odd'}>
                    <td className="rpt-mono">{r.kode_akun}</td>
                    <td className="rpt-name">{r.nama_akun}</td>
                    <td className="rpt-italic">{r.catatan || '-'}</td>
                    <td className="rpt-right rpt-mono">{formatRupiahCetak(r.nilai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      <ReportFooter />
    </div>
  )
}

const PrintableReport = forwardRef(function PrintableReport({ data, tab, date, user }, ref) {
  if (!data) return null

  return (
    <div ref={ref} id="print-area">
      {tab === 'neraca-saldo' && <NeracaSaldoView data={data} user={user} date={date} />}
      {tab === 'laba-rugi' && <LabaRugiView data={data} user={user} date={date} />}
      {tab === 'posisi-keuangan' && <PosisiKeuanganView data={data} user={user} date={date} />}
      {tab === 'calk' && <CalkView data={data} user={user} date={date} />}
    </div>
  )
})

export default PrintableReport
