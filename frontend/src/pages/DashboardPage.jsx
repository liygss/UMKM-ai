import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import { MotionBarShape, MotionActiveBar, MotionTooltip } from '../components/MotionChartShapes'
import { formatRupiah, formatRupiahCompact } from '../utils/formatters'
import { fadeUp, fadeIn, staggerContainer, itemStagger, EASE_GENTLE } from '../utils/motionPresets'
import { Banknote, TrendingUp, TrendingDown, Wallet, FileText, MessageSquare, Upload, Plus, ArrowRight, Activity, Calendar, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444']
const NEGATIVE_COLOR = '#EF4444'

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
    return (
      <MotionTooltip>
        <div className="rounded-xl p-3 shadow-xl" style={{ background: 'rgba(15, 26, 46, 0.95)', border: '1px solid rgba(148, 163, 184, 0.18)', backdropFilter: 'blur(12px)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name}: {formatRupiah(entry.value)}
            </p>
          ))}
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
  const { x, y, width, value, dataKey } = props
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill={dataKey === 'Pendapatan' ? '#34D399' : '#F87171'}>
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
  const color = payload.isNegative ? '#F87171' : (name === 'Kas' ? '#60A5FA' : '#34D399')
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central">
      <tspan x={x} dy={-9} fill={color} fontSize={11} fontWeight={700}>{name}</tspan>
      <tspan x={x} dy={16} fill="#E2E8F0" fontSize={11} fontWeight={700}>
        {payload.isNegative ? '-' : ''}{formatCompact(value)}
      </tspan>
      <tspan x={x} dy={14} fill="#64748B" fontSize={9} fontWeight={600}>
        {((percent || 0) * 100).toFixed(0)}%
      </tspan>
    </text>
  )
}

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
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
      stroke="rgba(15, 23, 42, 0.9)"
      strokeWidth={2}
      filter="drop-shadow(0 0 14px rgba(96, 165, 250, 0.45))"
    />
  )
}

const todayStr = () => new Date().toISOString().split('T')[0]

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [debouncedDate, setDebouncedDate] = useState(null)
  const [isAuto, setIsAuto] = useState(true)
  const autoRef = useRef(true)
  const debounceRef = useRef(null)
  const [pieActiveIndex, setPieActiveIndex] = useState(null)

  const handleDateChange = (newDate) => {
    autoRef.current = false
    setIsAuto(false)
    setSelectedDate(newDate)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedDate(newDate), 300)
  }

  const handleAuto = () => {
    autoRef.current = true
    setIsAuto(true)
    setSelectedDate('')
    clearTimeout(debounceRef.current)
    setDebouncedDate(null)
  }

  const handleToday = () => {
    autoRef.current = false
    setIsAuto(false)
    const t = todayStr()
    setSelectedDate(t)
    setDebouncedDate(t)
  }

  const openChatbot = () => window.dispatchEvent(new Event('open-chatbot'))

  const fetchData = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    const params = debouncedDate ? { tanggal_per: debouncedDate } : {}
    client.get('/dashboard/summary', { params })
      .then(r => {
        setData(r.data)
        if (autoRef.current && r.data.tanggal_per) setSelectedDate(r.data.tanggal_per)
      })
      .catch(() => {})
    client.get('/dashboard/monthly', { params })
      .then(r => setMonthly(r.data))
      .catch(() => {})
      .finally(() => { if (!silent) setLoading(false) })
  }, [debouncedDate])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh: muat ulang data saat tab fokus/terlihat kembali + interval,
  // dan saat ada event 'data-changed' (misal data diupload/dihapus dari halaman lain)
  // supaya dashboard selalu sinkron dan ikut kosong saat semua data dihapus.
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') fetchData(true) }
    const onDataChanged = () => fetchData(true)
    window.addEventListener('focus', refresh)
    window.addEventListener('data-changed', onDataChanged)
    document.addEventListener('visibilitychange', refresh)
    const timer = setInterval(() => fetchData(true), 15000)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('data-changed', onDataChanged)
      document.removeEventListener('visibilitychange', refresh)
      clearInterval(timer)
    }
  }, [fetchData])

  if (loading) return (
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

  if (!data) return (
    <div className="flex flex-col items-center justify-center mt-20 text-center">
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
        <Activity size={32} style={{ color: '#64748B' }} />
      </div>
      <p className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>Gagal memuat data dashboard</p>
      <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Pastikan server backend sedang berjalan</p>
    </div>
  )

  const isEmpty = data.jumlah_transaksi_bulan_ini === 0 && data.total_kas_dan_bank === 0

  const barData = monthly.map(m => ({
    name: m.label,
    Pendapatan: m.pendapatan,
    Beban: m.beban,
    laba_rugi: m.laba_rugi,
  }))
  const totalBebanPeriode = monthly.reduce((s, m) => s + m.beban, 0)
  const totalPendapatanPeriode = monthly.reduce((s, m) => s + m.pendapatan, 0)
  const pieData = [
    { name: 'Kas', value: Math.abs(data.saldo_kas), isNegative: data.saldo_kas < 0 },
    { name: 'Bank', value: Math.abs(data.saldo_bank), isNegative: data.saldo_bank < 0 },
  ].filter(d => d.value > 0)

  const selectedMonth = new Date((selectedDate || todayStr()) + 'T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

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
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Berikut ringkasan keuangan UMKM Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)', backdropFilter: 'blur(12px)' }}>
            <Calendar size={14} style={{ color: '#60A5FA' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer"
              style={{ color: '#CBD5E1', colorScheme: 'dark' }}
            />
            <button
              onClick={handleAuto}
              className="text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200"
              style={isAuto
                ? { color: '#60A5FA', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(96, 165, 250, 0.4)' }
                : { color: '#94A3B8', background: 'transparent' }}
            >
              Otomatis
            </button>
            <button
              onClick={handleToday}
              className="text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200"
              style={{ color: '#60A5FA', background: 'rgba(59, 130, 246, 0.12)' }}
            >
              Hari Ini
            </button>
          </div>
          <button
            onClick={() => fetchData()}
            title="Segarkan data"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-blue-500/10"
            style={{ color: '#60A5FA', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}
          >
            <RefreshCw size={13} />
            Segarkan
          </button>
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
                <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{action.label}</p>
              </div>
              <ArrowRight size={14} className="ml-auto transition hidden sm:block" style={{ color: '#64748B' }} />
            </>
          )
          const className = "group flex w-full items-center gap-3 rounded-xl p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          const style = { background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)', backdropFilter: 'blur(12px)' }

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
          style={{ color: '#94A3B8', border: '1px dashed rgba(148, 163, 184, 0.3)' }}
        >
          <Activity size={16} style={{ color: '#64748B' }} />
          <span>Belum ada data transaksi untuk periode ini. Data yang diupload atau dihapus akan langsung terlihat di dashboard.</span>
          <Link to="/upload" className="ml-auto text-xs font-semibold whitespace-nowrap" style={{ color: '#60A5FA' }}>Upload File</Link>
        </motion.div>
      )}
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <StatCard title="Saldo Kas" value={formatRupiahCompact(data.saldo_kas)} icon={Wallet} color={data.saldo_kas >= 0 ? 'indigo' : 'rose'} />
        <StatCard title="Saldo Bank" value={formatRupiahCompact(data.saldo_bank)} icon={Wallet} color={data.saldo_bank >= 0 ? 'indigo' : 'rose'} />
        <StatCard title={`Pendapatan ${selectedMonth}`} value={formatRupiahCompact(data.pendapatan_bulan_ini)} icon={TrendingUp} color="emerald" />
        <StatCard title={`Beban ${selectedMonth}`} value={formatRupiahCompact(data.beban_bulan_ini)} icon={TrendingDown} color="rose" />
        <StatCard title={`Laba/Rugi ${selectedMonth}`} value={formatRupiahCompact(data.laba_rugi_bulan_ini)} icon={Banknote} color={data.laba_rugi_bulan_ini >= 0 ? 'emerald' : 'rose'} />
      </motion.div>

      {/* Charts */}
      <motion.div
        key={debouncedDate || 'auto'}
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={fadeUp} whileHover={{ y: -4, transition: EASE_GENTLE }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Pendapatan vs Beban</h3>
            <span className="text-xs px-2 py-1 rounded-xl" style={{ color: '#94A3B8', background: 'rgba(255, 255, 255, 0.05)' }}>
              {monthly.length > 0 ? `${monthly[0].label} - ${monthly[monthly.length - 1].label}` : selectedMonth}
            </span>
          </div>
          {barData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={370}>
                <BarChart data={barData} barCategoryGap="30%" barGap={6} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => formatCompact(v)} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#CBD5E1' }} />
                  <Bar dataKey="Pendapatan" fill="url(#gradEmerald)" radius={[6,6,0,0]} maxBarSize={36} label={BarValueLabel} isAnimationActive={false} shape={MotionBarShape} activeBar={<MotionActiveBar />} />
                  <Bar dataKey="Beban" fill="url(#gradRose)" radius={[6,6,0,0]} maxBarSize={36} label={BarValueLabel} isAnimationActive={false} shape={MotionBarShape} activeBar={<MotionActiveBar />} />
                  <defs>
                    <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
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
            <div className="flex h-[250px] items-center justify-center text-sm" style={{ color: '#64748B' }}>Belum ada data untuk ditampilkan</div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} whileHover={{ y: -4, transition: EASE_GENTLE }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: '#F1F5F9' }}>Komposisi Kas & Bank</h3>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.12)', color: '#94A3B8' }}>
              {selectedMonth}
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
                      stroke="rgba(15, 23, 42, 0.9)"
                      strokeWidth={2}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="ease-out"
                      filter="url(#pieGlow)"
                      label={PieValueLabel}
                      labelLine={{ stroke: 'rgba(148, 163, 184, 0.35)', strokeWidth: 1 }}
                      activeIndex={pieActiveIndex}
                      activeShape={renderActiveShape}
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
                      formatter={(v, name, props) => `${props.payload.isNegative ? '-' : ''}${formatRupiah(v)}`}
                      contentStyle={{ background: 'rgba(15, 26, 46, 0.95)', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                      labelStyle={{ color: '#F1F5F9' }}
                      itemStyle={{ color: '#CBD5E1' }}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748B' }}>
                      Total Kas
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: '#F1F5F9' }}>
                      {formatRupiahCompact(data.saldo_kas)}
                    </span>
                  </motion.div>
                </div>
              </div>
              <motion.div
                variants={staggerContainer(0.12, 0.2)}
                initial="hidden"
                animate="visible"
                className="mt-4 space-y-2.5"
              >
                {pieData.map((entry, i) => {
                  const pct = (entry.value / Math.max(data.total_kas_dan_bank, 1)) * 100
                  const color = entry.isNegative ? NEGATIVE_COLOR : COLORS[i]
                  return (
                    <motion.div
                      key={i}
                      variants={itemStagger}
                      whileHover={{ x: 6, transition: EASE_GENTLE }}
                      className="rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-white/[0.03]"
                      style={{ background: 'rgba(148, 163, 184, 0.06)', border: '1px solid rgba(148, 163, 184, 0.1)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: '#E2E8F0' }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}66` }} />
                          {entry.name}
                        </span>
                        <span className="text-sm font-extrabold" style={{ color: '#F8FAFC' }}>
                          {entry.isNegative ? '-' : ''}{formatRupiah(entry.value)}
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${color}1f`, color }}>
                            {pct.toFixed(0)}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.12)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
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
            <div className="flex h-[250px] items-center justify-center text-sm" style={{ color: '#64748B' }}>Belum ada data saldo</div>
          )}
        </motion.div>
      </motion.div>

      {/* Summary Row */}
      <motion.div
        variants={staggerContainer(0.1, 0.15)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Total Pendapatan Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: '#34D399' }}>{formatRupiah(data.total_pendapatan_tahun_berjalan)}</p>
        </motion.div>
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Total Beban Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: '#F87171' }}>{formatRupiah(data.total_beban_tahun_berjalan)}</p>
        </motion.div>
        <motion.div variants={itemStagger} whileHover={{ y: -5, transition: EASE_GENTLE }} className="card">
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Laba/Rugi Tahun Berjalan</p>
          <p className="mt-2 text-xl font-extrabold" style={{ color: data.laba_rugi_tahun_berjalan >= 0 ? '#34D399' : '#F87171' }}>
            {formatRupiah(data.laba_rugi_tahun_berjalan)}
          </p>
        </motion.div>
      </motion.div>

      {/* Transaction Count */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -4, transition: EASE_GENTLE }} className="card flex items-center gap-4">
        <div
          className="rounded-2xl p-3 text-white shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
          }}
        >
          <FileText size={20} />
        </div>
        <div>
          <span className="text-sm font-medium" style={{ color: '#CBD5E1' }}>Transaksi {selectedMonth}</span>
          <p className="text-2xl font-extrabold" style={{ color: '#F1F5F9' }}>{data.jumlah_transaksi_bulan_ini}</p>
        </div>
        <Link to="/jurnal" className="ml-auto btn-ghost text-xs !px-3 !py-1.5">
          Lihat Jurnal <ArrowRight size={12} />
        </Link>
      </motion.div>
    </div>
  )
}
