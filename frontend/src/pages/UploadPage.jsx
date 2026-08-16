import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatRupiah, formatDateTime } from '../utils/formatters'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, XCircle, Clock, UploadCloud, Trash2, LayoutDashboard, TrendingUp, TrendingDown, Banknote, BarChart3, Sparkles } from 'lucide-react'

const STATUS_ICON = {
  UPLOADED: <Clock size={14} style={{ color: '#F59E0B' }} />,
  PROCESSING: <LoadingSpinner size="sm" />,
  NORMALIZED: <LoadingSpinner size="sm" />,
  INGESTED: <CheckCircle size={14} style={{ color: '#10B981' }} />,
  POSTED: <CheckCircle size={14} style={{ color: '#10B981' }} />,
  FAILED: <XCircle size={14} style={{ color: '#EF4444' }} />,
}

const STATUS_LABEL = {
  UPLOADED: 'Menunggu',
  PROCESSING: 'Diproses',
  NORMALIZED: 'Dinormalisasi',
  INGESTED: 'Tersimpan',
  POSTED: 'Berhasil',
  FAILED: 'Gagal',
}

const STATUS_COLOR = {
  UPLOADED: '#FBBF24',
  PROCESSING: '#FBBF24',
  NORMALIZED: '#FBBF24',
  INGESTED: '#34D399',
  POSTED: '#34D399',
  FAILED: '#F87171',
}

const PENDING_STATUS = ['UPLOADED', 'PROCESSING', 'NORMALIZED']
const DONE_STATUS = ['POSTED', 'INGESTED']

function SummaryCard({ summary }) {
  if (!summary) {
    return (
      <div className="card space-y-4">
        <div className="skeleton h-5 w-40 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const labaTahun = summary.laba_rugi_tahun_berjalan
  const labaBulan = summary.laba_rugi_bulan_ini
  const isEmpty = summary.total_kas_dan_bank === 0 && summary.jumlah_transaksi_bulan_ini === 0
  const bulanLabel = summary.tanggal_per
    ? new Date(summary.tanggal_per + 'T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : 'Bulan Ini'

  return (
    <div className="card relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)' }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#F1F5F9' }}>
            <BarChart3 size={16} style={{ color: '#60A5FA' }} />
            Ringkasan Laba/Rugi
          </h3>
          <span className="text-xs px-2 py-1 rounded-xl" style={{ color: '#94A3B8', background: 'rgba(255, 255, 255, 0.05)' }}>
            Data per {summary.tanggal_per || '-'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#6EE7B7' }}>
              <TrendingUp size={13} /> Pendapatan Tahun Berjalan
            </div>
            <p className="mt-1.5 text-xl font-extrabold tabular-nums" style={{ color: '#34D399' }}>{formatRupiah(summary.total_pendapatan_tahun_berjalan)}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#FCA5A5' }}>
              <TrendingDown size={13} /> Beban Tahun Berjalan
            </div>
            <p className="mt-1.5 text-xl font-extrabold tabular-nums" style={{ color: '#F87171' }}>{formatRupiah(summary.total_beban_tahun_berjalan)}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#93C5FD' }}>
              <Banknote size={13} /> Laba/Rugi Tahun Berjalan
            </div>
            <p className="mt-1.5 text-xl font-extrabold tabular-nums" style={{ color: labaTahun >= 0 ? '#60A5FA' : '#F87171' }}>{formatRupiah(labaTahun)}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#FCD34D' }}>
              <Sparkles size={13} /> Laba/Rugi {bulanLabel}
            </div>
            <p className="mt-1.5 text-xl font-extrabold tabular-nums" style={{ color: labaBulan >= 0 ? '#FBBF24' : '#F87171' }}>{formatRupiah(labaBulan)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
          {isEmpty ? (
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> Belum ada data transaksi. Setelah upload selesai diproses, ringkasan ini langsung terisi.
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <FileText size={13} /> {summary.jumlah_transaksi_bulan_ini} transaksi bulan ini &middot; Saldo kas &amp; bank {formatRupiah(summary.total_kas_dan_bank)}
            </span>
          )}
          <Link to="/" className="ml-auto flex items-center gap-1 font-semibold whitespace-nowrap" style={{ color: '#60A5FA' }}>
            <LayoutDashboard size={13} /> Lihat Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [summary, setSummary] = useState(null)

  const load = () => {
    client.get('/upload/')
      .then(r => setFiles(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const fetchSummary = useCallback(() => {
    client.get('/dashboard/summary')
      .then(r => setSummary(r.data))
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  // Sinkron summary saat data berubah dari halaman lain (upload/delete/reset)
  useEffect(() => {
    const onDataChanged = () => fetchSummary()
    window.addEventListener('data-changed', onDataChanged)
    return () => window.removeEventListener('data-changed', onDataChanged)
  }, [fetchSummary])

  const pendingCount = files.filter(f => PENDING_STATUS.includes(f.status)).length

  // Polling status proses: file yang sedang diproses dipantau terus sampai selesai,
  // supaya user langsung tahu data sudah siap / gagal diproses.
  useEffect(() => {
    if (loading || pendingCount === 0) return
    const poll = async () => {
      for (const f of files.filter(x => PENDING_STATUS.includes(x.status))) {
        try {
          const { data } = await client.get(`/upload/${f.id}`)
          setFiles(prev => prev.map(x => (x.id === data.id ? data : x)))
          if (DONE_STATUS.includes(data.status)) {
            toast.success(`${data.original_filename} berhasil diproses`)
            window.dispatchEvent(new Event('data-changed'))
            fetchSummary()
          } else if (data.status === 'FAILED') {
            toast.error(`${data.original_filename} gagal diproses: ${data.error_message || 'periksa kembali file Anda'}`)
          }
        } catch {
          /* ignore sementara, coba lagi di tick berikutnya */
        }
      }
    }
    const timer = setInterval(poll, 2000)
    return () => clearInterval(timer)
  }, [loading, files, fetchSummary])

  const deleteFile = async (id, filename) => {
    if (!confirm(`Hapus file "${filename}"?`)) return
    try {
      await client.delete(`/upload/${id}`)
      toast.success(`${filename} dihapus`)
      window.dispatchEvent(new Event('data-changed'))
      fetchSummary()
      load()
    } catch {
      toast.error('Gagal menghapus file')
    }
  }

  const upload = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      await client.post('/upload/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(`${file.name} terupload, sedang diproses otomatis...`)
      window.dispatchEvent(new Event('data-changed'))
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || `Gagal upload ${file.name}`)
    } finally {
      setUploading(false)
    }
  }

  const resetAll = async () => {
    if (!confirm('Hapus SEMUA data Anda (semua file upload, jurnal, dan data dashboard)? Tindakan ini tidak bisa dibatalkan.')) return
    try {
      await client.delete('/upload/reset')
      toast.success('Semua data berhasil dihapus')
      window.dispatchEvent(new Event('data-changed'))
      fetchSummary()
      load()
    } catch {
      toast.error('Gagal menghapus semua data')
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>Upload File</h1>
        <p className="text-sm" style={{ color: '#94A3B8' }}>Upload CSV transaksi atau PDF aturan untuk diproses ke knowledge base</p>
        <div className="mt-3 flex items-center gap-2">
          <Link to="/" className="btn-primary text-xs !py-2">
            <LayoutDashboard size={14} /> Lihat Dashboard
          </Link>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 rounded-lg text-xs font-medium px-2 py-2 transition-all duration-200 hover:bg-red-500/10"
            style={{ color: '#F87171', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
          >
            <Trash2 size={13} /> Hapus Semua Data
          </button>
          <span className="text-xs" style={{ color: '#64748B' }}>Semua dataset yang diupload otomatis masuk ke dashboard.</span>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="card border-2 border-dashed cursor-pointer transition-all"
        style={{ borderColor: dragging ? '#60A5FA' : 'rgba(148, 163, 184, 0.2)', background: dragging ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255, 255, 255, 0.02)' }}
      >
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="rounded-2xl p-4 transition-transform duration-300" style={{ background: dragging ? 'rgba(37, 99, 235, 0.15)' : 'rgba(59, 130, 246, 0.12)' }}>
            <UploadCloud size={32} style={{ color: dragging ? '#60A5FA' : '#60A5FA' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>{uploading ? 'Mengupload...' : 'Seret & lepas file di sini'}</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>atau klik untuk memilih file</p>
            <p className="text-xs" style={{ color: '#64748B' }}>CSV, XLSX, XLS, PDF (maks. 25 MB)</p>
          </div>
          <input type="file" className="hidden" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFileSelect} disabled={uploading} />
          {!uploading && <span className="btn-primary text-xs"><Upload size={14} /> Pilih File</span>}
        </label>
      </div>

      {pendingCount > 0 && (
        <div className="card flex items-center gap-3 text-sm" style={{ color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <LoadingSpinner size="sm" />
          <span>Sedang memproses {pendingCount} file... Tunggu sampai status berubah jadi <strong>Berhasil</strong>. Ringkasan laba/rugi akan terisi otomatis.</span>
        </div>
      )}

      <SummaryCard summary={summary} />

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#CBD5E1' }}>File yang Sudah Diupload</h3>
        {loading ? <LoadingSpinner className="mt-6" /> : files.length === 0 ? (
          <div className="card text-center py-8 text-sm" style={{ color: '#64748B' }}>Belum ada file yang diupload</div>
        ) : (
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.id} className="card flex items-center gap-4 !p-4">
                <FileText size={20} className="shrink-0" style={{ color: '#64748B' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>{f.original_filename}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{f.file_type} &middot; {formatSize(f.file_size_bytes)} &middot; {formatDateTime(f.created_at)}</p>
                  {f.error_message && <p className="text-xs mt-0.5" style={{ color: '#F87171' }}>{f.error_message}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
                  {STATUS_ICON[f.status]}
                  <span style={{ color: STATUS_COLOR[f.status] || '#D97706' }}>
                    {STATUS_LABEL[f.status] || f.status}
                  </span>
                </div>
                <button
                  onClick={() => deleteFile(f.id, f.original_filename)}
                  className="shrink-0 p-1.5 rounded-xl transition hover:bg-red-500/10 hover:text-red-400"
                  style={{ color: '#64748B' }}
                  title="Hapus file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
