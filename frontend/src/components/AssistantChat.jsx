import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Bot, Send, User, X, RotateCcw, Sparkles, FileText, Wallet, TrendingUp, ReceiptText, Landmark, Calculator } from 'lucide-react'
import { renderMarkdown, TypingIndicator, CopyButton } from '../utils/chatRender'

const SUGGESTIONS = [
  { text: 'Apa itu SAK EMKM?', icon: FileText, tone: 'blue' },
  { text: 'Cara membuat jurnal penjualan?', icon: ReceiptText, tone: 'sky' },
  { text: 'Bagaimana menghitung PPh Final UMKM?', icon: Calculator, tone: 'amber' },
]

const FINANCIAL_SUGGESTIONS = [
  { text: 'Berapa laba bersih bulan ini?', icon: Wallet, tone: 'emerald' },
  { text: 'Tampilkan neraca saldo', icon: Landmark, tone: 'blue' },
  { text: 'Ringkasan keuangan saya', icon: TrendingUp, tone: 'emerald' },
]

const TONE_STYLES = {
  blue: { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-brand-soft)', border: 'rgba(59, 130, 246, 0.25)' },
  sky: { bg: 'rgba(34, 211, 238, 0.1)', color: 'var(--color-accent-cyan)', border: 'rgba(34, 211, 238, 0.22)' },
  amber: { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--color-accent-amber)', border: 'rgba(251, 191, 36, 0.22)' },
  emerald: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-accent-emerald)', border: 'rgba(16, 185, 129, 0.22)' },
}

export default function AssistantChat({
  className = '',
  messages,
  input,
  setInput,
  loading,
  onSubmit,
  onReset,
  onClose,
  autoFocus = false,
  hideHeader = false,
}) {
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 250)
  }, [autoFocus])

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top brand glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.2), transparent)' }} />

      {/* Header */}
      {!hideHeader && (
        <div className="relative flex items-center gap-3 px-4 py-3">
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB 55%, #3B82F6)', boxShadow: '0 6px 20px var(--color-brand-glow), inset 0 1px 1px rgba(255,255,255,0.35)' }}>
            <Bot size={20} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2" style={{ background: '#10B981', borderColor: 'var(--color-surface-2)' }}>
            <span className="absolute h-full w-full rounded-full animate-ping" style={{ background: 'rgba(16,185,129,0.4)' }} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold leading-tight" style={{ color: 'var(--color-slate-heading)' }}>Asisten Finora</div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#10B981' }} />
            Online · Siap membantu
          </div>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {messages.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onReset}
              className="p-2 rounded-xl transition"
              style={{ color: 'var(--color-slate-muted)' }}
              title="Mulai percakapan baru"
            >
              <RotateCcw size={16} />
            </motion.button>
          )}
          {onClose && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl transition"
              style={{ color: 'var(--color-slate-body)' }}
              title="Tutup"
            >
              <X size={18} />
            </motion.button>
          )}
        </div>
      </div>
      )}

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto space-y-3 px-4 py-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <motion.div
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
              className="mb-5"
            >
              <div className="rounded-2xl p-3.5" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(59,130,246,0.08))', border: '1px solid rgba(96, 165, 250, 0.28)', boxShadow: '0 8px 26px var(--color-brand-glow)' }}>
                <Sparkles size={20} style={{ color: 'var(--color-brand-soft)' }} />
              </div>
            </motion.div>
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--color-slate-heading)' }}>Halo, ada yang bisa saya bantu?</h2>
            <p className="text-sm mt-1.5 mb-6" style={{ color: 'var(--color-slate-muted)' }}>Ketik pertanyaan Anda, atau pilih salah satu topik di bawah ini</p>
            <div className="w-full max-w-md space-y-2 text-left">
              {[...SUGGESTIONS, ...FINANCIAL_SUGGESTIONS].map((s) => (
                <SuggestionChip key={s.text} {...s} onClick={() => { setInput(s.text); inputRef.current?.focus() }} />
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', boxShadow: '0 4px 14px var(--color-brand-glow)', alignSelf: 'flex-start' }}>
                <Bot size={15} />
              </div>
            )}
            <div
              className={`max-w-[82%] ${msg.role === 'user' ? 'text-white' : ''}`}
              style={msg.role === 'user'
                ? {
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                  boxShadow: '0 6px 18px var(--color-brand-glow), inset 0 1px 1px rgba(255,255,255,0.25)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 6,
                  padding: '10px 14px',
                }
                : {
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-slate-text)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.18)',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 20,
                  padding: '10px 14px',
                }}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
              {msg.has_financial_data && msg.role === 'assistant' && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-accent-emerald)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }}></span>
                    Menggunakan data keuangan Anda
                  </span>
                </div>
              )}
              <div className={`flex items-center gap-2 mt-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                <span className="text-[10px] opacity-70" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--color-slate-muted)' }}>{msg.time}</span>
                {msg.role === 'assistant' && <CopyButton text={msg.content} />}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', border: '1px solid rgba(148, 163, 184, 0.45)', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.35)', alignSelf: 'flex-start' }}>
                <User size={15} />
              </div>
            )}
          </motion.div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="relative px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 rounded-2xl p-1.5 pl-4 transition focus-within:shadow-[0_0_0_3px_var(--color-brand-glow)]" style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            disabled={loading}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:opacity-60"
            style={{ color: 'var(--color-slate-heading)' }}
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-35"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 14px var(--color-brand-glow)' }}
            aria-label="Kirim"
          >
            <Send size={15} />
          </motion.button>
        </div>
      </form>
    </div>
  )
}

function SuggestionChip({ text, icon: Icon, tone, onClick }) {
  const style = TONE_STYLES[tone] || TONE_STYLES.blue
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition"
      style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        <Icon size={15} />
      </span>
      <span className="text-xs font-medium leading-snug flex-1" style={{ color: 'var(--color-slate-text)' }}>{text}</span>
    </motion.button>
  )
}