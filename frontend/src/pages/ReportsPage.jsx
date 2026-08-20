import { useState, useEffect, useCallback, useRef } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { buildAllReportsFullHtml } from '../utils/reportPdfBuilder'
import { formatRupiah } from '../utils/formatters'
import toast from 'react-hot-toast'
import { extractError } from '../api/extractError'
import { FileDown, FileSpreadsheet, FileText, TrendingUp, TrendingDown, Scale, AlertCircle, Loader2 } from 'lucide-react'

const TABS = [
  { key: 'neraca-saldo', label: 'Neraca Saldo', icon: Scale },
  { key: 'laba-rugi', label: 'Laba Rugi', icon: TrendingUp },
  { key: 'posisi-keuangan', label: 'Posisi Keuangan', icon: TrendingDown },
  { key: 'calk', label: 'CALK', icon: AlertCircle },
]

function usePdfDownload(date, user) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = useCallback(async () => {
    setGenerating(true)

    try {
      const reports = ['neraca-saldo', 'laba-rugi', 'posisi-keuangan', 'calk']
      const results = await Promise.all(
        reports.map(rt => client.get(`/accounting/laporan/${rt}`, { params: { tanggal_per: date } }).then(r => [rt, r.data]))
      )
      const allData = Object.fromEntries(results)

      const fullHtml = buildAllReportsFullHtml(allData, date, user)

      // Pakai hidden iframe (bukan window.open yang diblokir Electron)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)

      const doc = iframe.contentWindow.document
      doc.open()
      doc.write(fullHtml)
      doc.close()

      const waitForRender = () => {
        if (doc.readyState === 'complete') {
          setTimeout(() => {
            try {
              iframe.contentWindow.focus()
              iframe.contentWindow.print()
            } catch (e) {
              console.error('Print error:', e)
            }
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
            toast.success('Dialog print siap! Pilih "Save as PDF" untuk simpan.')
            setGenerating(false)
          }, 500)
        } else {
          setTimeout(waitForRender, 100)
        }
      }
      waitForRender()
    } catch (err) {
      console.error('PDF generation error:', err)
      toast.error('Gagal membuat PDF. Coba lagi.')
      setGenerating(false)
    }
  }, [date, user])

  return { handleDownload, generating }
}

function useExportDownload(date) {
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async (format) => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token') || ''
      const baseURL = import.meta.env.VITE_API_URL || '/api'
      const ext = format === 'xlsx' ? 'xlsx' : 'csv'
      const url = `${baseURL}/accounting/laporan/export-all?format=${format}&tanggal_per=${date}&token=${encodeURIComponent(token)}`

      // Pakai direct <a> link (bukan blob) — otomatis trigger download
      // di browser maupun Electron (lewat will-download handler).
      const link = document.createElement('a')
      link.href = url
      link.download = `laporan-keuangan-semua-${date}.${ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => {
        toast.success(`${ext.toUpperCase()} berhasil diunduh!`)
        setExporting(false)
      }, 1500)
    } catch (err) {
      console.error('Export error:', err)
      toast.error(`Gagal export ${format.toUpperCase()}. Coba lagi.`)
      setExporting(false)
    }
  }, [date])

  return { handleExport, exporting }
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('neraca-saldo')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [debouncedDate, setDebouncedDate] = useState(date)
  const debounceRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDateChange = (newDate) => {
    setDate(newDate)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedDate(newDate), 300)
  }

  const { handleDownload: downloadPdf, generating: pdfGenerating } = usePdfDownload(debouncedDate, user)
  const { handleExport, exporting } = useExportDownload(debouncedDate)

  const load = useCallback(() => {
    setLoading(true)
    setData(null)
    setError(null)
    const url = `/accounting/laporan/${tab}?tanggal_per=${debouncedDate}`
    client.get(url)
      .then(r => setData(r.data))
      .catch((err) => {
        const msg = extractError(err, 'Gagal memuat laporan')
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [tab, debouncedDate])

  useEffect(() => { load() }, [load])

  const isBusy = pdfGenerating || exporting

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">Laporan Keuangan</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Neraca saldo, laba rugi, posisi keuangan & CALK</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Tanggal:</label>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} className="input-field w-auto !py-2" />
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setDate(today)
              setDebouncedDate(today)
            }}
            className="text-xs font-medium px-2.5 py-2 rounded-lg transition-all duration-200"
            style={{ color: '#60A5FA', background: 'rgba(59, 130, 246, 0.12)' }}
          >
            Hari Ini
          </button>
          <div className="flex items-center gap-1 rounded-xl p-1 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
            <button
              onClick={() => downloadPdf()}
              disabled={isBusy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
              style={{
                background: !isBusy ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(148, 163, 184, 0.12)',
                color: !isBusy ? 'white' : '#64748B',
                cursor: !isBusy ? 'pointer' : 'not-allowed',
                boxShadow: !isBusy ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
              }}
              title="Download semua laporan (Neraca Saldo, Laba Rugi, Posisi Keuangan, CALK)"
            >
              {pdfGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
              PDF (Semua)
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={isBusy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
              style={{
                background: !isBusy ? 'linear-gradient(135deg, #059669, #10B981)' : 'rgba(148, 163, 184, 0.12)',
                color: !isBusy ? 'white' : '#64748B',
                cursor: !isBusy ? 'pointer' : 'not-allowed',
              }}
              title="Download semua laporan (Neraca Saldo, Laba Rugi, Posisi Keuangan, CALK)"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
              Excel (Semua)
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isBusy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
              style={{
                background: !isBusy ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'rgba(148, 163, 184, 0.12)',
                color: !isBusy ? 'white' : '#64748B',
                cursor: !isBusy ? 'pointer' : 'not-allowed',
              }}
              title="Download semua laporan (Neraca Saldo, Laba Rugi, Posisi Keuangan, CALK)"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              CSV (Semua)
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl p-1 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setData(null); setTab(t.key) }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200"
            style={tab === t.key ? {
              background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            } : {
              color: '#94A3B8',
            }}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {data && tab === 'neraca-saldo' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div className="card !p-4 flex items-center gap-3 hover:-translate-y-0.5">
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
              <TrendingUp size={18} style={{ color: '#34D399' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Total Debit</p>
              <p className="text-lg font-extrabold tabular-nums" style={{ color: '#F1F5F9' }}>{formatRupiah(data.total_debit)}</p>
            </div>
          </div>
          <div className="card !p-4 flex items-center gap-3 hover:-translate-y-0.5">
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
              <TrendingDown size={18} style={{ color: '#F87171' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Total Kredit</p>
              <p className="text-lg font-extrabold tabular-nums" style={{ color: '#F1F5F9' }}>{formatRupiah(data.total_kredit)}</p>
            </div>
          </div>
          <div className="card !p-4 flex items-center gap-3 hover:-translate-y-0.5">
            <div className="rounded-xl p-2.5" style={{ background: data.is_balance ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)' }}>
              <Scale size={18} style={{ color: data.is_balance ? '#34D399' : '#F87171' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Status</p>
              <p className="text-lg font-extrabold" style={{ color: data.is_balance ? '#34D399' : '#F87171' }}>
                {data.is_balance ? 'Balance' : 'Tidak Balance'}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner className="mt-10" /> : !data ? (
        error ? (
          <div className="card text-center py-10">
            <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#EF4444' }} />
            <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{error}</p>
            <button onClick={load} className="btn-primary mt-4 !px-4 !py-2 text-sm">Coba Lagi</button>
          </div>
        ) : null
      ) : (
        <div className="card page-enter">
          {tab === 'neraca-saldo' && <NeracaSaldoView data={data} />}
          {tab === 'laba-rugi' && <LabaRugiView data={data} />}
          {tab === 'posisi-keuangan' && <PosisiKeuanganView data={data} />}
          {tab === 'calk' && <CalkView data={data} />}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Screen Views (for on-page display)
   ================================================================ */

function KategoriBadge({ kategori }) {
  const map = {
    ASET: 'badge-aset',
    LIABILITAS: 'badge-liabilitas',
    MODAL: 'badge-modal',
    PENDAPATAN: 'badge-pendapatan',
    BEBAN: 'badge-beban',
  }
  const cls = map[kategori]
  if (!cls) return (
    <span className="badge" style={{ background: 'rgba(148,163,184,0.12)', color: '#94A3B8', border: '1px solid rgba(148,163,184,0.2)' }}>
      {kategori}
    </span>
  )
  return <span className={`badge ${cls}`}>{kategori}</span>
}

function NeracaSaldoView({ data }) {
  if (!data) return null
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: '#F1F5F9' }}>Neraca Saldo</h3>
        <span className="badge" style={{ background: data.is_balance ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: data.is_balance ? '#34D399' : '#F87171' }}>
          {data.is_balance ? 'Balance' : 'Tidak Balance'}
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(148, 163, 184, 0.2)' }}>
              <th className="tbl-header">Kode</th>
              <th className="tbl-header">Nama Akun</th>
              <th className="tbl-header">Kategori</th>
              <th className="tbl-header num-cell">Debit</th>
              <th className="tbl-header num-cell">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {(data.baris || []).map((r, i) => (
              <tr key={i} className="tbl-row" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="tbl-cell font-mono text-xs font-semibold" style={{ color: '#60A5FA' }}>{r.kode_akun}</td>
                <td className="tbl-cell font-medium" style={{ color: '#F1F5F9' }}>{r.nama_akun}</td>
                <td className="tbl-cell"><KategoriBadge kategori={r.kategori} /></td>
                <td className="tbl-cell num-cell font-mono text-xs">{r.debit > 0 ? formatRupiah(r.debit) : '-'}</td>
                <td className="tbl-cell num-cell font-mono text-xs">{r.kredit > 0 ? formatRupiah(r.kredit) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold" style={{ borderTop: '2px solid rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}>
              <td colSpan={3} className="py-3 px-6 uppercase tracking-wider text-xs" style={{ color: '#93C5FD' }}>Total</td>
              <td className="py-3 px-6 num-cell font-mono text-sm font-extrabold" style={{ color: '#F1F5F9' }}>{formatRupiah(data.total_debit)}</td>
              <td className="py-3 px-6 num-cell font-mono text-sm font-extrabold" style={{ color: '#F1F5F9' }}>{formatRupiah(data.total_kredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function LabaRugiView({ data }) {
  if (!data) return null
  return (
    <div className="space-y-5">
      <h3 className="font-bold" style={{ color: '#F1F5F9' }}>Laporan Laba Rugi</h3>
      <Section title="Pendapatan" items={data.pendapatan || []} />
      <Section title="HPP" items={data.hpp || []} />
      <div className="flex justify-between pt-3 font-semibold text-sm" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <span className="text-[#CBD5E1]">Laba Kotor</span>
        <span className="font-mono tabular-nums text-[#F1F5F9]">{formatRupiah(data.laba_kotor)}</span>
      </div>
      <Section title="Beban Operasional" items={data.beban_operasional || []} />
      <div className="flex justify-between pt-3 font-bold text-lg rounded-2xl p-4 -mx-4" style={{ borderTop: '2px solid rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}>
        <span className="uppercase tracking-wider text-xs" style={{ color: '#93C5FD' }}>Laba Bersih</span>
        <span className="font-mono tabular-nums" style={{ color: data.laba_bersih >= 0 ? '#34D399' : '#F87171' }}>{formatRupiah(data.laba_bersih)}</span>
      </div>
    </div>
  )
}

function PosisiKeuanganView({ data }) {
  if (!data) return null
  return (
    <div className="space-y-5">
      <h3 className="font-bold" style={{ color: '#F1F5F9' }}>Laporan Posisi Keuangan</h3>
      <Section title="Aset" items={data.aset || []} total={data.total_aset} />
      <Section title="Liabilitas" items={data.liabilitas || []} total={data.total_liabilitas} />
      <Section title="Modal" items={data.modal || []} />
      <div className="flex justify-between pt-3 text-sm" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <span className="text-[#CBD5E1]">Laba/Rugi Berjalan</span>
        <span className="font-mono font-medium tabular-nums text-[#F1F5F9]">{formatRupiah(data.laba_rugi_berjalan)}</span>
      </div>
      <div className="flex justify-between pt-3 font-bold text-lg rounded-2xl p-4 -mx-4" style={{ borderTop: '2px solid rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}>
        <span className="uppercase tracking-wider text-xs" style={{ color: '#93C5FD' }}>Total Liabilitas + Modal</span>
        <span className="font-mono tabular-nums text-[#F1F5F9]">{formatRupiah(data.total_liabilitas_dan_modal)}</span>
      </div>
      <span className="badge" style={{ background: data.is_balance ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: data.is_balance ? '#34D399' : '#F87171' }}>
        {data.is_balance ? 'Balance' : 'Tidak Balance'}
      </span>
    </div>
  )
}

function CalkView({ data }) {
  if (!data) return <p className="text-sm" style={{ color: '#64748B' }}>Tidak ada data CALK</p>
  return (
    <div className="space-y-5">
      <h3 className="font-bold" style={{ color: '#F1F5F9' }}>Catatan Atas Laporan Keuangan (CALK)</h3>
      {data.kebijakan_akuntansi?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>Kebijakan Akuntansi</h4>
          <ul className="list-disc list-inside text-sm space-y-1 rounded-2xl p-4" style={{ color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
            {data.kebijakan_akuntansi.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        </div>
      )}
      <Section title="Rincian Aset" items={data.rincian_aset || []} showNote />
      <Section title="Rincian Liabilitas" items={data.rincian_liabilitas || []} showNote />
      <Section title="Rincian Pendapatan" items={data.rincian_pendapatan || []} showNote />
      <Section title="Rincian Beban" items={data.rincian_beban || []} showNote />
      {data.catatan_tambahan?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>Catatan Tambahan</h4>
          <ul className="list-disc list-inside text-sm space-y-1 rounded-2xl p-4" style={{ color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
            {data.catatan_tambahan.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function Section({ title, items, total, showNote }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2" style={{ color: '#CBD5E1' }}>{title}</h4>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(148, 163, 184, 0.2)' }}>
              <th className="tbl-header">Kode</th>
              <th className="tbl-header">Nama Akun</th>
              {showNote && <th className="tbl-header">Catatan</th>}
              <th className="tbl-header num-cell">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i} className="tbl-row" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="tbl-cell font-mono text-xs font-semibold" style={{ color: '#60A5FA' }}>{r.kode_akun}</td>
                <td className="tbl-cell font-medium" style={{ color: '#F1F5F9' }}>{r.nama_akun}</td>
                {showNote && <td className="tbl-cell text-xs italic" style={{ color: '#94A3B8' }}>{r.catatan || '-'}</td>}
                <td className="tbl-cell num-cell font-mono text-xs">{formatRupiah(r.nilai)}</td>
              </tr>
            ))}
          </tbody>
          {total !== undefined && (
            <tfoot>
              <tr className="font-bold" style={{ borderTop: '2px solid rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}>
                <td colSpan={showNote ? 3 : 2} className="px-6 py-3 text-xs uppercase tracking-wider" style={{ color: '#93C5FD' }}>Total {title}</td>
                <td className="px-6 py-3 num-cell font-mono text-sm font-extrabold" style={{ color: '#F1F5F9' }}>{formatRupiah(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
