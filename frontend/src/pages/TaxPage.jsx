import { useState } from 'react'
import client from '../api/client'
import { formatRupiah } from '../utils/formatters'
import toast from 'react-hot-toast'
import { extractError } from '../api/extractError'
import { Calculator, Receipt, Percent, Info, CheckCircle2 } from 'lucide-react'

export default function TaxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">
          <span className="gradient-text">Kalkulator Pajak</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Hitung PPh Final UMKM dan PPN secara cepat</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PPhFinalCard />
        <PPNCard />
      </div>
    </div>
  )
}

function PPhFinalCard() {
  const [omzet, setOmzet] = useState('')
  const [kumulatif, setKumulatif] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const hitung = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await client.post('/accounting/pajak/pph-final-umkm', {
        omzet_bulan_ini: parseFloat(omzet) || 0,
        omzet_kumulatif_sebelum_bulan_ini: parseFloat(kumulatif) || 0,
        wp_orang_pribadi: true,
      })
      setResult(data)
    } catch (err) {
      toast.error(extractError(err, 'Gagal menghitung'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="rounded-2xl p-3 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}
        >
          <Receipt size={20} />
        </div>
        <div>
          <h3 className="font-bold" style={{ color: '#F1F5F9' }}>PPh Final UMKM</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Tarif 0,5% dari omzet</p>
            <div className="group relative">
              <Info size={12} style={{ color: '#64748B' }} className="cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-10" style={{ background: 'rgba(15, 26, 46, 0.95)', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                PPh Final 0,5% berlaku untuk UMKM dengan omzet sampai 4,8 Miliar/tahun
              </div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={hitung} className="space-y-4">
        <div>
          <label className="label">Omzet Bulan Ini</label>
          <input type="number" min="0" required value={omzet} onChange={e => setOmzet(e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div>
          <label className="label">Omzet Kumulatif Sebelumnya</label>
          <input type="number" min="0" value={kumulatif} onChange={e => setKumulatif(e.target.value)} className="input-field" placeholder="0" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          <Calculator size={16} /> {loading ? 'Menghitung...' : 'Hitung PPh Final'}
        </button>
      </form>
      {result && (
        <div className="mt-5 rounded-2xl p-5 space-y-3 text-sm animate-fade-in" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-center justify-between">
            <span style={{ color: '#94A3B8' }}>Omzet Kumulatif</span>
            <span className="font-mono font-semibold text-[#F1F5F9]">{formatRupiah(result.omzet_kumulatif_tahun_berjalan)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: '#94A3B8' }}>Omzet Kena Pajak</span>
            <span className="font-mono font-semibold text-[#F1F5F9]">{formatRupiah(result.omzet_kena_pajak)}</span>
          </div>
          <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span className="font-bold flex items-center gap-1.5" style={{ color: '#F1F5F9' }}>
              <CheckCircle2 size={14} style={{ color: '#FBBF24' }} />
              PPh Final Terutang
            </span>
            <span className="font-mono font-extrabold text-lg" style={{ color: '#FBBF24' }}>{formatRupiah(result.pph_final_terutang)}</span>
          </div>
          {result.catatan && (
            <p className="text-xs italic mt-2 rounded-xl p-2" style={{ color: '#94A3B8', background: 'rgba(255, 255, 255, 0.06)' }}>{result.catatan}</p>
          )}
        </div>
      )}
    </div>
  )
}

function PPNCard() {
  const [nilai, setNilai] = useState('')
  const [termasuk, setTermasuk] = useState(false)
  const [mewah, setMewah] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const hitung = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await client.post('/accounting/pajak/ppn', {
        nilai: parseFloat(nilai) || 0,
        sudah_termasuk_ppn: termasuk,
        barang_mewah: mewah,
      })
      setResult(data)
    } catch (err) {
      toast.error(extractError(err, 'Gagal menghitung'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="rounded-2xl p-3 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
        >
          <Percent size={20} />
        </div>
        <div>
          <h3 className="font-bold" style={{ color: '#F1F5F9' }}>PPN (VAT)</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Tarif 11% atau 12% (barang mewah)</p>
            <div className="group relative">
              <Info size={12} style={{ color: '#64748B' }} className="cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-xl p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-10" style={{ background: 'rgba(15, 26, 46, 0.95)', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                PPN Standar 11%, barang mewah dikenakan 12%
              </div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={hitung} className="space-y-4">
        <div>
          <label className="label">Nilai Transaksi</label>
          <input type="number" min="0" required value={nilai} onChange={e => setNilai(e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group" style={{ color: '#CBD5E1' }}>
            <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition" style={{ background: termasuk ? '#2563EB' : 'transparent', borderColor: termasuk ? '#2563EB' : '#64748B' }}>
              {termasuk && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <input type="checkbox" checked={termasuk} onChange={e => setTermasuk(e.target.checked)} className="sr-only" />
            Sudah termasuk PPN
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group" style={{ color: '#CBD5E1' }}>
            <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition" style={{ background: mewah ? '#2563EB' : 'transparent', borderColor: mewah ? '#2563EB' : '#64748B' }}>
              {mewah && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <input type="checkbox" checked={mewah} onChange={e => setMewah(e.target.checked)} className="sr-only" />
            Barang mewah
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          <Calculator size={16} /> {loading ? 'Menghitung...' : 'Hitung PPN'}
        </button>
      </form>
      {result && (
        <div className="mt-5 rounded-2xl p-5 space-y-3 text-sm animate-fade-in" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="flex items-center justify-between">
            <span style={{ color: '#94A3B8' }}>Dasar Pengenaan Pajak</span>
            <span className="font-mono font-semibold text-[#F1F5F9]">{formatRupiah(result.dasar_pengenaan_pajak)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: '#94A3B8' }}>Tarif</span>
            <span className="font-semibold text-[#F1F5F9]">{(result.tarif_digunakan * 100).toFixed(0)}%</span>
          </div>
          <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <span className="font-bold flex items-center gap-1.5" style={{ color: '#F1F5F9' }}>
              <CheckCircle2 size={14} style={{ color: '#60A5FA' }} />
              PPN Terutang
            </span>
            <span className="font-mono font-extrabold text-lg" style={{ color: '#60A5FA' }}>{formatRupiah(result.ppn)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-2.5" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
            <span className="font-medium" style={{ color: '#94A3B8' }}>Harga Termasuk PPN</span>
            <span className="font-mono font-extrabold" style={{ color: '#F1F5F9' }}>{formatRupiah(result.harga_termasuk_ppn)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
