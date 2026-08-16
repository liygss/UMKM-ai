import { motion } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatRupiah } from '../utils/formatters'
import MotionNumber from './MotionNumber'
import { fadeUp, EASE_GENTLE } from '../utils/motionPresets'

const GRADIENT_BG = {
  indigo: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
  emerald: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  rose: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
  amber: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
  blue: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
}

const SHADOW = {
  indigo: '0 8px 24px rgba(59, 130, 246, 0.35)',
  emerald: '0 8px 24px rgba(16, 185, 129, 0.3)',
  rose: '0 8px 24px rgba(239, 68, 68, 0.3)',
  amber: '0 8px 24px rgba(245, 158, 11, 0.3)',
  blue: '0 8px 24px rgba(59, 130, 246, 0.35)',
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'indigo', animate = true }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  const isNumeric = typeof numericValue === 'number' && !isNaN(numericValue)

  const displayValue = isNumeric && animate
    ? <MotionNumber value={numericValue} format={formatRupiah} />
    : value

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: EASE_GENTLE }}
      className="card group flex items-start justify-between relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300" style={{ background: GRADIENT_BG[color] }} />
      <div className="relative">
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>{title}</p>
        <p className="mt-2 text-2xl font-extrabold" style={{ color: '#F1F5F9' }}>{displayValue}</p>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: trend > 0 ? '#34D399' : trend < 0 ? '#F87171' : '#94A3B8' }}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {Icon && (
        <motion.div
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={EASE_GENTLE}
          className="relative rounded-2xl p-3 text-white"
          style={{ background: GRADIENT_BG[color], boxShadow: SHADOW[color] }}
        >
          <Icon size={22} />
          <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" style={{ background: GRADIENT_BG[color] }} />
        </motion.div>
      )}
    </motion.div>
  )
}
