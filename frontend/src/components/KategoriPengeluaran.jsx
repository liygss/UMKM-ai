import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { PieChart as PieIcon } from 'lucide-react'
import client from '../api/client'
import { formatRupiah } from '../utils/formatters'
import { fadeUp, staggerContainer, itemStagger, EASE_GENTLE } from '../utils/motionPresets'

const CATEGORY_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const TOP_N = 5

export default function KategoriPengeluaran({ debouncedDate }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    const params = debouncedDate ? { tanggal_per: debouncedDate } : {}
    client.get('/dashboard/kategori', { params })
      .then((r) => { if (!cancelled) setItems((r.data || []).map((i) => ({ name: i.nama_akun, nilai: i.nilai, kode_akun: i.kode_akun }))) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedDate])

  const total = items.reduce((s, i) => s + i.nilai, 0)
  const top = items.slice(0, TOP_N)
  const sisa = items.slice(TOP_N).reduce((s, i) => s + i.nilai, 0)
  const rows = sisa > 0 ? [...top, { name: 'Lainnya', nilai: sisa, isOther: true }] : top

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, transition: EASE_GENTLE }} className="card flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl p-2" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
            <PieIcon size={16} style={{ color: '#FBBF24' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-slate-heading)' }}>Kategori Pengeluaran Terbesar</h3>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-body)' }}>Uang paling banyak keluar ke mana</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3.5 w-2/3 rounded-lg" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-sm" style={{ color: 'var(--color-slate-muted)' }}>
          Gagal memuat data kategori
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm" style={{ color: 'var(--color-slate-muted)' }}>
          Belum ada pengeluaran bulan ini
        </div>
      ) : (
        <motion.div variants={staggerContainer(0.08, 0.12)} initial="hidden" animate="visible" className="space-y-3 flex-1">
          {rows.map((row, i) => {
            const pct = total > 0 ? (row.nilai / total) * 100 : 0
            const color = row.isOther ? '#94A3B8' : CATEGORY_COLORS[i % CATEGORY_COLORS.length]
            return (
              <motion.div key={row.name} variants={itemStagger} className="rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/[0.03]"
                style={{ background: 'rgba(148, 163, 184, 0.05)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold truncate" style={{ color: 'var(--color-slate-text)' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="truncate">{row.name}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold" style={{ color: 'var(--color-slate-heading)' }}>{formatRupiah(row.nilai)}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}1f`, color }}>{pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.12)' }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}