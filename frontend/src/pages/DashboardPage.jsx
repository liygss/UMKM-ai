import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import StatCard from '../components/StatCard'
import { MotionBarShape, MotionActiveBar, MotionTooltip } from '../components/MotionChartShapes'
import { formatRupiah, formatRupiahCompact, formatDate } from '../utils/formatters'
import DatePickerField from '../components/DatePickerField'
import DateRangeField from '../components/DateRangeField'
import { getDashboardState, setDashboardState, clearDashboard } from '../utils/dashboardStore'
import { fadeUp, fadeIn, staggerContainer, itemStagger, EASE_GENTLE } from '../utils/motionPresets'
import { Banknote, TrendingUp, TrendingDown, Wallet, MessageSquare, Upload, Plus, ArrowRight, Activity, Calendar, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts'
import InsightCard from '../components/InsightCard'
import KategoriPengeluaran from '../components/KategoriPengeluaran'
import ProdukBarang from '../components/ProdukBarang'
import TemuanPenting from '../components/TemuanPenting'
import RingkasanPiutangUtang from '../components/RingkasanPiutangUtang'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444']
const NEGATIVE_COLOR = '#EF4444'

const BAR_LEGEND = [
  { name: 'Pendapatan', color: '#10B981', glow: 'rgba(16, 185, 129, 0.5)' },
  { name: 'Beban', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)' },
]
const SERIES_COLORS = { Pendapatan: '#34D399', Beban: '#F87171' }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Selamat pagi'
  if (h < 17) return 'Selamat siang'
  if (h < 21) return 'Selamat sore'
  return 'Selamat malam'
}

const QUICK_ACTIONS = [
  { action: 'open-chatbot', label: 'Tanya AI', icon: MessageSquare, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)', textColor: '#2563EB' },
  { to: '/upload', label: 'Upload File', icon: Upload, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', textColor: '#10B981' },
  { to: '/jurnal', label: 'Jurnal Baru', icon: Plus, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', textColor: '#F59E0B' },
]

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const net = payload[0]?.payload?.laba_rugi ?? 0
    return (
      <MotionTooltip>
        <div className="rounded-xl p-3 shadow-xl" style={{ background: 'var(--color-tooltip-bg)', border: '1px solid var(--color-tooltip-border)', backdropFilter: 'blur(12px)', minWidth: 200 }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-slate-body)' }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: SERIES_COLORS[entry.dataKey] || entry.color }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: SERIES_COLORS[entry.dataKey] || entry.color }} />
              {entry.name}: {formatRupiah(entry.value)}
            </p>
          ))}
          <div className="mt-1.5 pt-1.5 flex items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-slate-body)' }}>Laba/Rugi</span>
            <span className="text-sm font-extrabold" style={{ color: net >= 0 ? '#34D399' : '#F87171' }}>{formatRupiah(net)}</span>
          </div>
        </div>
      </MotionTooltip>
    )
  }
  return null
}

function formatCompact(value) {
  const v = Number(value) || 0
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`
  return `${v}`
}

function BarValueLabel(props) {
  const { x, y, width, height, value, isLight } = props
  if (!value || !height || height < 14) return null
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fill={isLight ? '#0F172A' : '#F4F8FD'}
      stroke={isLight ? 'none' : '#050A14'}
      strokeWidth={3}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      {formatCompact(value)}
    </text>
  )
}

function PieValueLabel(props) {
  const { cx, cy, midAngle, outerRadius, name, value, percent, payload } = props
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 22
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  const anchor = x > cx ? 'start' : 'end'
  const color = payload.isNegative ? 'var(--color-accent-red)' : (name === 'Kas' ? 'var(--color-accent-blue)' : 'var(--color-accent-emerald)')
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central">
      <tspan x={x} dy={-9} fill={color} fontSize={11} fontWeight={700}>{name}</tspan>
      <tspan x={x} dy={16} fill="var(--color-slate-text)" fontSize={11} fontWeight={700}>
        {payload.isNegative ? '-' : ''}{formatCompact(value)}
      </tspan>
      <tspan x={x} dy={14} fill="var(--color-slate-muted)" fontSize={9} fontWeight={600}>
        {((percent || 0) * 100).toFixed(0)}%
      </tspan>
    </text>
  )
}

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isLight } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 7}
      startAngle={startAngle}
      endAngle={endAngle}
      cornerRadius={10}
      fill={fill}
      stroke={isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)'}
      strokeWidth={2}
      filter={isLight ? undefined : 'drop-shadow(0 0 14px rgba(96, 165, 250, 0.45))'}
    />
  )
}

function localDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayStr = () => localDateStr(new Date())

// "2026-08" → "2026-08-31" (hari terakhir pada bulan tersebut)
function monthEnd(ym) {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return `${ym}-${String(last).padStart(2, '0')}`
}

// "2026-08" → "Agustus 2026" (nama bulan & tahun, tanpa masalah timezone)
function formatMonthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function BarTrendCardInner({ monthly, monthLabel, isLight, barAnimDone }) {
  const barData = useMemo(
    () => monthly.map(m => ({ name: m.label, Pendapatan: m.pendapatan, Beban: m.beban, laba_rugi: m.laba_rugi })),
    [monthly],
  )
  const totalBebanPeriode = useMemo(() => monthly.reduce((s, m) => s + m.beban, 0), [monthly])
  const totalPendapatanPeriode = useMemo(() => monthly.reduce((s, m) => s + m.pendapatan, 0), [monthly])
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, transition: EASE_GENTLE }} className="card lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-slate-heading)' }}>Pendapatan vs Beban</h3>
        <span className="text-xs px-2 py-1 rounded-xl" style={{ color: 'var(--color-slate-body)', background: 'var(--color-surface-card)' }}>
          {monthly.length > 0 ? `${monthly[0].label} - ${monthly[monthly.length - 1].label}` : monthLabel}
        </span>
      </div>
      {barData.length > 0 ? (
        <>
          <div className="flex items-center gap-5 mb-1">
            {BAR_LEGEND.map((item) => (
              <span key={item.name} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-slate-text)' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.glow}` }} />
                {item.name}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={370}>
            <BarChart data={barData} barCategoryGap="18%" barGap={8} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-slate-body)' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-slate-body)' }} tickFormatter={(v) => formatCompact(v)} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
              <Bar
                dataKey="Pendapatan"
                fill="url(#gradEmerald)"
                radius={[8, 8, 0, 0]}
                maxBarSize={52}
                label={(p) => <BarValueLabel {...p} isLight={isLight} />}
                isAnimationActive={false}
                shape={<MotionBarShape animate={!barAnimDone} glowColor={isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.35)'} />}
                activeBar={<MotionActiveBar glowColor={isLight ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.55)'} />}
              />
              <Bar
                dataKey="Beban"
                fill="url(#gradRose)"
                radius={[8, 8, 0, 0]}
                maxBarSize={52}
                label={(p) => <BarValueLabel {...p} isLight={isLight} />}
                isAnimationActive={false}
                shape={<MotionBarShape animate={!barAnimDone} glowColor={isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.35)'} />}
                activeBar={<MotionActiveBar glowColor={isLight ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.55)'} />}
              />
              <defs>
                <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="45%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" />
                  <stop offset="45%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          {totalPendapatanPeriode > 0 && totalBebanPeriode === 0 && (
            <p className="text-xs mt-3" style={{ color: '#FBBF24', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 12px', borderRadius: 12 }}>
              Belum ada <strong>beban</strong> tercatat pada periode ini — bar beban tidak tampil karena nilainya 0.
              Upload juga data pengeluaran (mis. pembelian bahan, gaji, sewa) supaya perbandingan pendapatan vs beban terlihat lengkap.
            </p>
          )}
        </>
      ) : (
        <div className="flex h-[250px] items-center justify-center text-sm" style={{ color: 'var(--color-slate-muted)' }}>Belum ada data untuk ditampilkan</div>
      )}
    </motion.div>
  )
}
const BarTrendCard = memo(BarTrendCardInner)

function KasBankPieCardInner({ data, monthLabel, isLight }) {
  // State hover dipindah ke dalam kartu supaya hover pie tidak me-render ulang
  // seluruh dashboard (hanya kartu ini yang berubah).
  const [pieActiveIndex, setPieActiveIndex] = useState(null)
  const saldoKas = data.saldo_kas || 0
  const saldoBank = data.saldo_bank || 0
  const hasNegative = saldoKas < 0 || saldoBank < 0
  // Denominator share: jumlah MAGNITUDE (nilai absolut) tiap komponen. Dipakai
  // untuk persentase legend karena doughnut/bar digambar dari nilai absolut —
  // memakai total_kas_dan_bank yang bisa negatif → menyebabkan persen raksasa.
  const absTotal = Math.abs(saldoKas) + Math.abs(saldoBank)
  const totalForPct = absTotal > 0 ? absTotal : 1
  const kasPct = absTotal > 0 ? (Math.abs(saldoKas) / absTotal) * 100 : 0
  const bankPct = absTotal > 0 ? (Math.abs(saldoBank) / absTotal) * 100 : 0
  const pieData = useMemo(
    () => [
      { name: 'Kas', value: Math.abs(saldoKas), isNegative: saldoKas < 0 },
      { name: 'Bank', value: Math.abs(saldoBank), isNegative: saldoBank < 0 },
    ].filter(d => d.value > 0),
    [saldoKas, saldoBank],
  )
  const activePieEntry = pieActiveIndex != null ? pieData[pieActiveIndex] : null
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, transition: EASE_GENTLE }} className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-slate-heading)' }}>Komposisi Kas & Bank</h3>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.12)', color: 'var(--color-slate-body)' }}>
          {monthLabel}
        </span>
      </div>
      {pieData.length > 0 ? (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  <linearGradient id="gradKas" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="gradBank" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                  <linearGradient id="gradNeg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                  <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={[{ value: 1 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  fill="rgba(148, 163, 184, 0.07)"
                  stroke="none"
                  isAnimationActive={false}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={4}
                  cornerRadius={10}
                  startAngle={90}
                  endAngle={-270}
                  stroke={isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)'}
                  strokeWidth={2}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                  filter={isLight ? undefined : 'url(#pieGlow)'}
                  label={PieValueLabel}
                  labelLine={{ stroke: 'rgba(148, 163, 184, 0.35)', strokeWidth: 1 }}
                  activeIndex={pieActiveIndex}
                  activeShape={(p) => renderActiveShape({ ...p, isLight })}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isNegative
                        ? 'url(#gradNeg)'
                        : entry.name === 'Kas' ? 'url(#gradKas)' : 'url(#gradBank)'}
                      onMouseEnter={() => setPieActiveIndex(i)}
                      onMouseLeave={() => setPieActiveIndex(null)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name, props) => formatRupiah(v)}
                  contentStyle={{ background: 'var(--color-tooltip-bg)', border: '1px solid var(--color-tooltip-border)', borderRadius: 12, boxShadow: '0 8px 24px var(--color-shadow)' }}
                  labelStyle={{ color: 'var(--color-slate-heading)' }}
                  itemStyle={{ color: 'var(--color-slate-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key="total"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={EASE_GENTLE}
                className="flex flex-col items-center"
              >
                {activePieEntry ? (
                  <>
                    <span className="max-w-[110px] truncate text-[10px] font-bold uppercase tracking-wider" style={{ color: activePieEntry.isNegative ? 'var(--color-accent-red)' : 'var(--color-slate-muted)' }}>
                      {activePieEntry.name}
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: activePieEntry.isNegative ? 'var(--color-accent-red)' : 'var(--color-slate-heading)' }}>
                      {formatRupiahCompact(activePieEntry.value)}
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5" style={{ background: COLORS[pieActiveIndex] + '1f', color: 'var(--color-slate-text)' }}>
                      {((activePieEntry.value / totalForPct) * 100).toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate-muted)' }}>
                      Total Kas & Bank
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: 'var(--color-slate-heading)' }}>
                      {formatRupiahCompact(data.total_kas_dan_bank)}
                    </span>
                  </>
                )}
              </motion.div>
            </div>
          </div>
          <motion.div
            variants={staggerContainer(0.12, 0.2)}
            initial="hidden"
            animate="visible"
            className="mt-4 space-y-2.5"
          >
            {(saldoKas !== 0 || saldoBank !== 0) && [
              { name: 'Kas', value: Math.abs(saldoKas), isNegative: saldoKas < 0, pct: kasPct },
              { name: 'Bank', value: Math.abs(saldoBank), isNegative: saldoBank < 0, pct: bankPct },
            ].filter(d => d.value > 0).map((entry, i) => {
              const color = entry.isNegative ? NEGATIVE_COLOR : COLORS[i]
              return (
                <motion.div
                  key={entry.name}
                  variants={itemStagger}
                  whileHover={{ x: 6, transition: EASE_GENTLE }}
                  className="rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: 'var(--color-slate-text)' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
                      {entry.name}{entry.isNegative ? ' (Overdraft)' : ''}
                    </span>
                    <span className="text-sm font-extrabold" style={{ color: entry.isNegative ? 'var(--color-accent-red)' : 'var(--color-slate-heading)' }}>
                      {entry.isNegative ? '-' : ''}{formatRupiah(Math.abs(entry.value))}
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}1f`, color }}>
                        {entry.pct.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.12)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${entry.pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      ) : (
        <div className="flex h-[250px] items-center justify-center text-sm" style={{ color: 'var(--color-slate-muted)' }}>Belum ada data saldo</div>
      )}
    </motion.div>
  )
}
const KasBankPieCard = memo(KasBankPieCardInner)

export default function DashboardPage() {
  const { user } = useAuth()
  const { mode } = useTheme()
  const isLight = mode === 'light'
  // Satu response /dashboard/overview berisi summary + monthly + alerts +
  // piutang/utang + kategori → 1 request saja (yang dulu 5 paralel).
  // State di-hidrasi dari cache level-modul supaya balik dari halaman lain
  // langsung tampil tanpa skeleton & tanpa fetch ulang (kecuali data baru).
  const cachedInit = useRef(null)
  if (cachedInit.current === null) cachedInit.current = getDashboardState()
  const cachedData = cachedInit.current?.data ?? null
  const [overview, setOverview] = useState(cachedData)
  const data = overview?.summary ?? null
  const [loading, setLoading] = useState(!cachedData)
  // Referensi turunan stabil dari satu response overview supaya widget memo
  // (StatCard, TemuanPenting, dll.) hanya re-render saat data aslinya berubah.
  // Dideklarasikan sebelum effect/useMemo lain yang memakainya (TDZ aman).
  const monthly = useMemo(() => overview?.monthly ?? [], [overview])
  const alerts = useMemo(() => overview?.alerts ?? [], [overview])
  const piutangUtang = useMemo(() => overview?.piutang_utang ?? null, [overview])
  const kategori = useMemo(() => overview?.kategori ?? [], [overview])
  const produk = useMemo(() => overview?.produk ?? [], [overview])
  // Periode dashboard = bulan (format "YYYY-MM"). Manual mengirim tanggal_per
  // = hari terakhir bulan tsb supaya angka mewakili full bulan; Otomatis ikut
  // tanggal data terbaru dari backend.
  const [selectedMonth, setSelectedMonth] = useState(cachedInit.current?.selectedMonth ?? '')
  const [debouncedMonth, setDebouncedMonth] = useState(
    cachedInit.current && !cachedInit.current.isAuto ? cachedInit.current.selectedMonth : null,
  )
  const [isAuto, setIsAuto] = useState(cachedInit.current?.isAuto ?? true)
  const autoRef = useRef(cachedInit.current?.isAuto ?? true)
  const debounceRef = useRef(null)
  // Tandai navigasi periode dari aksi user (ganti bulan / Otomatis / Bulan Ini) —
  // dipakai memutuskan apakah fetch perlu jalan saat debouncedMonth berubah.
  const monthNavRef = useRef(false)
  const initDoneRef = useRef(false)
  // Animasi grow bar hanya diputar sekali saat data pertama tampil;
  // auto-refresh diam (interval/fokus tab) tidak boleh mengulang animasinya.
  const [barAnimDone, setBarAnimDone] = useState(cachedInit.current?.barAnimDone ?? false)
  // Saat backend belum siap (baru dinyalakan), tampilkan pemuatan & coba ulang
  // otomatis beberapa kali supaya user tidak salah kira dashboard gagal.
  const [connecting, setConnecting] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const CONNECT_MAX_ATTEMPT = 4

  // Date range state untuk custom period view
  const [rangeStartDate, setRangeStartDate] = useState('')
  const [rangeEndDate, setRangeEndDate] = useState('')
  const [debouncedRangeStart, setDebouncedRangeStart] = useState('')
  const [debouncedRangeEnd, setDebouncedRangeEnd] = useState('')
  const rangeDebounceRef = useRef(null)

  const handleDateChange = (newMonth) => {
    monthNavRef.current = true
    autoRef.current = false
    setIsAuto(false)
    setSelectedMonth(newMonth)
    setRangeStartDate('')
    setRangeEndDate('')
    setDebouncedRangeStart('')
    setDebouncedRangeEnd('')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedMonth(newMonth), 300)
  }

  const handleAuto = () => {
    monthNavRef.current = true
    autoRef.current = true
    setIsAuto(true)
    setSelectedMonth('')
    setRangeStartDate('')
    setRangeEndDate('')
    setDebouncedRangeStart('')
    setDebouncedRangeEnd('')
    clearTimeout(debounceRef.current)
    setDebouncedMonth(null)
  }

  const handleToday = () => {
    monthNavRef.current = true
    autoRef.current = false
    setIsAuto(false)
    const ym = todayStr().slice(0, 7)
    setSelectedMonth(ym)
    setRangeStartDate('')
    setRangeEndDate('')
    setDebouncedRangeStart('')
    setDebouncedRangeEnd('')
    setDebouncedMonth(ym)
  }

  const handleRangeStartChange = (v) => {
    monthNavRef.current = true
    autoRef.current = false
    setIsAuto(false)
    setSelectedMonth('')
    setDebouncedMonth(null)
    setRangeStartDate(v)
    clearTimeout(rangeDebounceRef.current)
    rangeDebounceRef.current = setTimeout(() => setDebouncedRangeStart(v), 300)
  }

  const handleRangeEndChange = (v) => {
    monthNavRef.current = true
    autoRef.current = false
    setIsAuto(false)
    setSelectedMonth('')
    setDebouncedMonth(null)
    setRangeEndDate(v)
    clearTimeout(rangeDebounceRef.current)
    rangeDebounceRef.current = setTimeout(() => setDebouncedRangeEnd(v), 300)
  }

  const openChatbot = () => window.dispatchEvent(new Event('open-chatbot'))

  const fetchData = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    let params = {}
    if (debouncedRangeStart && debouncedRangeEnd) {
      params = { tanggal_mulai: debouncedRangeStart, tanggal_per: debouncedRangeEnd }
    } else if (debouncedMonth) {
      params = { tanggal_per: monthEnd(debouncedMonth) }
    }
    client.get('/dashboard/overview', { params })
      .then(r => {
        setOverview(r.data)
        setConnecting(false)
        setAttempt(0)
        setGaveUp(false)
        const autoMonth = autoRef.current && r.data.summary.tanggal_per
          ? r.data.summary.tanggal_per.slice(0, 7)
          : ''
        if (autoRef.current) setSelectedMonth(autoMonth)
        // Simpan ke cache supaya balik dari halaman lain tidak perlu fetch ulang.
        setDashboardState({
          key: debouncedMonth || 'auto',
          data: r.data,
          isAuto: autoRef.current,
          selectedMonth: autoRef.current ? autoMonth : (debouncedMonth || ''),
          barAnimDone: getDashboardState().barAnimDone,
        })
      })
      .catch(() => setConnecting(true))
      .finally(() => { if (!silent) setLoading(false) })
  }, [debouncedMonth])

  // Mount sekali: kalau cache periode tersedia (balik dari halaman lain),
  // jangan fetch ulang sama sekali. Fetch hanya saat belum ada cache
  // (kunjungan pertama / ada data baru sementara dashboard tidak aktif).
  useEffect(() => {
    if (initDoneRef.current) return undefined
    initDoneRef.current = true
    if (cachedInit.current?.data) {
      autoRef.current = cachedInit.current.isAuto
      return undefined
    }
    fetchData()
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ganti periode lewat aksi user (pilih bulan / Otomatis / Bulan Ini) →
  // fetch data periode tersebut. Navigasi dari halaman lain (mount) tidak
  // pernah memicu fetch di sini karena monthNavRef masih false.
  useEffect(() => {
    if (monthNavRef.current) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMonth])

  // Retry otomatis saat koneksi gagal: backend kadang baru hidup, jangan
  // langsung tampilkan "gagal muat". Setelah batas percobaan habis barulah
  // muncul pesan server tidak terjangkau — bukan saat page masih rendering.
  useEffect(() => {
    if (connecting) {
      if (attempt < CONNECT_MAX_ATTEMPT) {
        const t = setTimeout(() => {
          fetchData()
          setAttempt(a => a + 1)
        }, 2500)
        return () => clearTimeout(t)
      } else if (!data) {
        setGaveUp(true)
      }
    }
    return undefined
  }, [connecting, attempt, data, fetchData])

  // Setelah animasi grow bar pertama selesai (~1.6s), matikan animasi supaya
  // navigasi balik tidak mengulang animasi (flag ikut disimpan di cache).
  useEffect(() => {
    if (loading || barAnimDone || monthly.length === 0) return undefined
    const t = setTimeout(() => setBarAnimDone(true), 1600)
    return () => clearTimeout(t)
  }, [loading, monthly, barAnimDone])

  // Sinkronkan flag animasi ke cache level-modul.
  useEffect(() => {
    const cached = getDashboardState()
    if (cached?.data && cached.barAnimDone !== barAnimDone) {
      setDashboardState({ barAnimDone })
    }
  }, [barAnimDone])

  // Refresh hanya saat data benar-benar berubah (upload/jurnal baru/hapus file):
  // buang cache lalu fetch diam-diam. Tidak ada auto-refresh interval/fokus —
  // balik dari halaman lain tidak boleh memicu render ulang.
  useEffect(() => {
    const onDataChanged = () => {
      clearDashboard()
      fetchData(true)
    }
    window.addEventListener('data-changed', onDataChanged)
    return () => window.removeEventListener('data-changed', onDataChanged)
  }, [fetchData])

  // Bulan periode terpilih: manual ("YYYY-MM") atau bulan dari data otomatis.
  const periodMonth = debouncedMonth || (data?.tanggal_per ? data.tanggal_per.slice(0, 7) : todayStr().slice(0, 7))
  const monthLabel = formatMonthLabel(periodMonth)
  // Tanggal penuh yang dikirim ke backend (akhir bulan saat manual).
  const periodDateKey = debouncedMonth ? monthEnd(debouncedMonth) : null
  const periodCaption = isAuto
    ? `Periode otomatis · ringkasan s/d ${data ? formatDate(data.tanggal_per) : '…'}`
    : `Periode: ${monthLabel}`

  // Perbandingan bulan ini vs bulan lalu (%), dari data monthly yang sudah di-fetch.
  const { deltaPendapatan, deltaBeban, deltaLaba } = useMemo(() => {
    const delta = (key) => {
      if (monthly.length < 2) return undefined
      const prev = monthly[monthly.length - 2][key]
      if (!prev) return undefined
      const curr = monthly[monthly.length - 1][key]
      return Math.round(((curr - prev) / prev) * 100)
    }
    return { deltaPendapatan: delta('pendapatan'), deltaBeban: delta('beban'), deltaLaba: delta('laba_rugi') }
  }, [monthly])

  // Selama data belum ada & belum menyerah, tahan skeleton — jangan pernah
  // turun ke render dashboard saat data masih null (menghindari crash).
  if (loading || (connecting && !gaveUp) || (!data && !gaveUp)) return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-4 w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="skeleton h-4 w-24 rounded-lg" />
            <div className="skeleton h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!data && gaveUp) return (
    <div className="flex flex-col items-center justify-center mt-20 text-center">
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
        <Activity size={32} style={{ color: 'var(--color-slate-muted)' }} />
      </div>
      <p className="text-lg font-semibold" style={{ color: 'var(--color-slate-heading)' }}>Tidak dapat terhubung ke server</p>
      <p className="text-sm mt-1 max-w-md" style={{ color: 'var(--color-slate-body)' }}>
        Pastikan backend sudah berjalan, lalu coba lagi. Halaman ini akan otomatis dimuat ulang saat server kembali aktif.
      </p>
      <button
        onClick={() => { setAttempt(0); setGaveUp(false); setConnecting(false); fetchData() }}
        className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 6px 18px var(--color-brand-glow)' }}
      >
        Coba lagi
      </button>
    </div>
  )

  const isEmpty = data.jumlah_transaksi_bulan_ini === 0 && data.total_kas_dan_bank === 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">{getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-slate-body)' }}>Berikut ringkasan keuangan UMKM Anda</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm" style={{ background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.16)', backdropFilter: 'blur(12px)' }}>
              <Calendar size={14} style={{ color: 'var(--color-brand-soft)' }} />
              <DateRangeField
                startDate={rangeStartDate}
                endDate={rangeEndDate}
                onStartChange={handleRangeStartChange}
                onEndChange={handleRangeEndChange}
              />
              <button
                onClick={handleAuto}
                className="text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200"
                style={isAuto
                  ? { color: 'var(--color-brand-soft)', background: 'rgba(59, 130, 246, 0.16)', border: '1px solid rgba(125, 180, 255, 0.4)' }
                  : { color: 'var(--color-slate-body)', background: 'transparent' }}
              >
                Otomatis
              </button>
              <button
                onClick={handleToday}
                className="text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200"
                style={{ color: 'var(--color-brand-soft)', background: 'rgba(59, 130, 246, 0.14)' }}
              >
                Bulan Ini
              </button>
            </div>
            <button
              onClick={() => fetchData()}
              title="Segarkan data"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-blue-500/10"
              style={{ color: 'var(--color-brand-soft)', background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.16)' }}
            >
              <RefreshCw size={13} />
              Segarkan
            </button>
          </div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-slate-muted)' }}>{periodCaption}</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={staggerContainer(0.09)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3"
      >
        {QUICK_ACTIONS.map((action) => {
          const inner = (
            <>
              <div className="rounded-xl p-2 transition-transform group-hover:scale-110" style={{ background: action.bg }}>
                <action.icon size={18} style={{ color: action.textColor }} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-slate-heading)' }}>{action.label}</p>
              </div>
              <ArrowRight size={14} className="ml-auto transition hidden sm:block" style={{ color: 'var(--color-slate-muted)' }} />
            </>
          )
          const className = "group flex w-full items-center gap-3 rounded-xl p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          const style = { background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.14)', backdropFilter: 'blur(12px)' }

          return action.action === 'open-chatbot' ? (
            <motion.button
              key={action.label}
              variants={itemStagger}
              whileHover={{ y: -5, transition: EASE_GENTLE }}
              whileTap={{ scale: 0.97 }}
              onClick={openChatbot}
              className={className}
              style={style}
            >
              {inner}
            </motion.button>
          ) : (
            <motion.div key={action.to} variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} whileTap={{ scale: 0.97 }}>
              <Link to={action.to} className={className} style={style}>
                {inner}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Stat Cards */}
      {isEmpty && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="card flex items-center gap-3 text-sm"
          style={{ color: 'var(--color-slate-body)', border: '1px dashed rgba(148, 163, 184, 0.3)' }}
        >
          <Activity size={16} style={{ color: 'var(--color-slate-muted)' }} />
          <span>Belum ada data transaksi untuk periode ini. Data yang diupload atau dihapus akan langsung terlihat di dashboard.</span>
          <Link to="/upload" className="ml-auto text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-brand-soft)' }}>Upload File</Link>
        </motion.div>
      )}
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <StatCard title="Saldo Kas" value={data.saldo_kas} format={formatRupiahCompact} icon={Wallet} color="indigo" />
        <StatCard
          title={data.saldo_bank < 0 ? 'Overdraft Bank' : 'Saldo Bank'}
          value={Math.abs(data.saldo_bank)}
          format={formatRupiahCompact}
          icon={Wallet}
          color={data.saldo_bank < 0 ? 'rose' : 'indigo'}
        />
        <StatCard title={`Pendapatan ${monthLabel}`} value={data.pendapatan_bulan_ini} format={formatRupiahCompact} icon={TrendingUp} color="emerald" trend={deltaPendapatan} />
        <StatCard title={`Beban ${monthLabel}`} value={data.beban_bulan_ini} format={formatRupiahCompact} icon={TrendingDown} color="rose" trend={deltaBeban} trendUpIsGood={false} />
        <StatCard title={`Laba/Rugi ${monthLabel}`} value={data.laba_rugi_bulan_ini} format={formatRupiahCompact} icon={Banknote} color={data.laba_rugi_bulan_ini >= 0 ? 'emerald' : 'rose'} trend={deltaLaba} />
      </motion.div>

      {/* Summary Tahun Berjalan */}
      <motion.div
        variants={staggerContainer(0.1, 0.15)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: 'var(--color-slate-body)' }}>Total Pendapatan Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: '#34D399' }}>{formatRupiah(data.total_pendapatan_tahun_berjalan)}</p>
        </motion.div>
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: 'var(--color-slate-body)' }}>Total Beban Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: '#F87171' }}>{formatRupiah(data.total_beban_tahun_berjalan)}</p>
        </motion.div>
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: 'var(--color-slate-body)' }}>Laba/Rugi Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: data.laba_rugi_tahun_berjalan >= 0 ? '#34D399' : '#F87171' }}>
            {formatRupiah(data.laba_rugi_tahun_berjalan)}
          </p>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        key={periodDateKey || 'auto'}
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <BarTrendCard monthly={monthly} monthLabel={monthLabel} isLight={isLight} barAnimDone={barAnimDone} />
        <KasBankPieCard data={data} monthLabel={monthLabel} isLight={isLight} />
      </motion.div>

      {/* Ringkasan Piutang/Utang & Kategori & Produk */}
      <motion.div
        variants={staggerContainer(0.1, 0.15)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <RingkasanPiutangUtang data={piutangUtang} />
        <KategoriPengeluaran debouncedDate={periodDateKey} items={kategori} />
        <ProdukBarang items={produk} />
      </motion.div>

      {/* Temuan Penting & Insight AI */}
      <motion.div
        variants={staggerContainer(0.1, 0.15)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <TemuanPenting alerts={alerts} />
        <InsightCard debouncedDate={periodDateKey} />
      </motion.div>
    </div>
  )
}
