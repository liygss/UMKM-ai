import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ compact = false }) {
  const { mode, toggle } = useTheme()
  const isLight = mode === 'light'

  return (
    <button
      type="button"
      data-tour="theme-toggle"
      onClick={toggle}
      title={isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
      aria-label={isLight ? 'Mode gelap' : 'Mode terang'}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 ${
        compact ? 'h-9 w-9' : 'h-10 w-10'
      }`}
      style={{
        background: 'var(--color-surface-faint)',
        border: '1px solid var(--color-border-soft)',
        color: 'var(--color-slate-body)',
      }}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
