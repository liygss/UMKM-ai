import { useState, useEffect } from 'react'
import client from '../api/client'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, X, Search } from 'lucide-react'

const KATEGORI = ['ASET', 'LIABILITAS', 'MODAL', 'PENDAPATAN', 'BEBAN']
const SALDO = ['DEBIT', 'KREDIT']

const KATEGORI_BADGE = {
  ASET: 'badge-aset',
  LIABILITAS: 'badge-liabilitas',
  MODAL: 'badge-modal',
  PENDAPATAN: 'badge-pendapatan',
  BEBAN: 'badge-beban',
}

export default function AccountingPage() {
  const [akun, setAkun] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kode_akun: '', nama_akun: '', kategori: 'ASET', saldo_normal: 'DEBIT', sub_kategori: '' })

  const load = () => {
    setLoading(true)
    client.get('/accounting/akun')
      .then(r => setAkun(r.data))
      .catch(() => toast.error('Gagal memuat akun'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  let filtered = filter ? akun.filter(a => a.kategori === filter) : akun
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(a => a.nama_akun.toLowerCase().includes(q) || a.kode_akun.toLowerCase().includes(q))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await client.post('/accounting/akun', form)
      toast.success('Akun berhasil ditambahkan')
      setShowForm(false)
      setForm({ kode_akun: '', nama_akun: '', kategori: 'ASET', saldo_normal: 'DEBIT', sub_kategori: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menambah akun')
    }
  }

  const columns = [
    { header: 'Kode', accessor: 'kode_akun', render: r => <span className="font-mono font-semibold" style={{ color: '#60A5FA' }}>{r.kode_akun}</span> },
    { header: 'Nama Akun', accessor: 'nama_akun', render: r => <span className="font-medium" style={{ color: '#F1F5F9' }}>{r.nama_akun}</span> },
    { header: 'Kategori', accessor: 'kategori', render: r => (
      <span className={`badge ${KATEGORI_BADGE[r.kategori] || ''}`} style={!KATEGORI_BADGE[r.kategori] ? { background: 'rgba(148,163,184,0.12)', color: '#94A3B8' } : undefined}>{r.kategori}</span>
    )},
    { header: 'Saldo Normal', accessor: 'saldo_normal', render: r => (
      <span className="badge" style={{ background: r.saldo_normal === 'DEBIT' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)', color: r.saldo_normal === 'DEBIT' ? '#34D399' : '#93C5FD' }}>{r.saldo_normal}</span>
    )},
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">Chart of Accounts</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Daftar akun sesuai SAK EMKM</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Tambah Akun</button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200" style={!filter ? { background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' } : { background: 'rgba(255, 255, 255, 0.04)', color: '#94A3B8', border: '1px solid rgba(148, 163, 184, 0.14)' }}>Semua</button>
          {KATEGORI.map(k => (
            <button key={k} onClick={() => setFilter(k)} className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200" style={filter === k ? { background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' } : { background: 'rgba(255, 255, 255, 0.04)', color: '#94A3B8', border: '1px solid rgba(148, 163, 184, 0.14)' }}>{k}</button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari akun..."
            className="input-field !pl-9 !py-2 !text-xs w-48"
          />
        </div>
      </div>

      {loading ? <LoadingSpinner className="mt-10" /> : (
        <DataTable columns={columns} data={filtered} emptyMessage="Belum ada akun" />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)} style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md card animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Tambah Akun Baru</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl transition hover:bg-white/10" style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Kode Akun</label>
                <input required value={form.kode_akun} onChange={e => setForm({...form, kode_akun: e.target.value})} className="input-field" placeholder="1-1100" />
              </div>
              <div>
                <label className="label">Nama Akun</label>
                <input required value={form.nama_akun} onChange={e => setForm({...form, nama_akun: e.target.value})} className="input-field" placeholder="Kas" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Kategori</label>
                  <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="input-field">
                    {KATEGORI.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Saldo Normal</label>
                  <select value={form.saldo_normal} onChange={e => setForm({...form, saldo_normal: e.target.value})} className="input-field">
                    {SALDO.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Sub Kategori <span className="font-normal" style={{ color: '#64748B' }}>(opsional)</span></label>
                <input value={form.sub_kategori} onChange={e => setForm({...form, sub_kategori: e.target.value})} className="input-field" placeholder="Kas & Bank" />
              </div>
              <button type="submit" className="btn-primary w-full !py-3">Simpan Akun</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
