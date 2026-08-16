import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, MessageSquare, Send, User, X, RotateCcw, Sparkles } from 'lucide-react'
import useChatbot from '../hooks/useChatbot'
import { renderMarkdown, TypingIndicator, CopyButton } from '../utils/chatRender'

const SUGGESTIONS = [
  { text: 'Apa itu SAK EMKM?', icon: '📋' },
  { text: 'Cara membuat jurnal penjualan?', icon: '📝' },
  { text: 'Bagaimana menghitung PPh Final UMKM?', icon: '🧮' },
]

const FINANCIAL_SUGGESTIONS = [
  { text: 'Berapa laba bersih bulan ini?', icon: '💰' },
  { text: 'Tampilkan neraca saldo', icon: '📊' },
  { text: 'Ringkasan keuangan saya', icon: '📈' },
]

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const { messages, input, setInput, loading, send, reset } = useChatbot()
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const prevLen = useRef(0)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-chatbot', onOpen)
    return () => window.removeEventListener('open-chatbot', onOpen)
  }, [])

  useEffect(() => {
    const delta = messages.length - prevLen.current
    prevLen.current = messages.length
    if (!open && delta > 0) setUnread(u => u + delta)
  }, [messages, open])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex h-[540px] max-h-[72vh] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl shadow-2xl"
            style={{
              background: 'rgba(9, 15, 28, 0.94)',
              backdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(59, 130, 246, 0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.12)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)' }}>
                  <Bot size={18} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2" style={{ background: '#10B981', borderColor: '#0A101E' }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold" style={{ color: '#F1F5F9' }}>AI UMKM</div>
                <div className="text-[11px] font-medium" style={{ color: '#34D399' }}>Online • Asisten Akuntansi</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    className="p-2 rounded-xl transition hover:bg-white/10"
                    style={{ color: '#64748B' }}
                    title="Mulai percakapan baru"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl transition hover:bg-white/10" style={{ color: '#94A3B8' }} title="Tutup">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                  <motion.div
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                    className="relative mb-4"
                  >
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                      <Sparkles size={26} style={{ color: '#3B82F6' }} />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse" style={{ background: '#10B981' }} />
                  </motion.div>
                  <p className="text-base font-bold" style={{ color: '#F1F5F9' }}>Ada yang bisa saya bantu?</p>
                  <p className="text-xs mt-0.5 mb-4" style={{ color: '#64748B' }}>Tanya seputar akuntansi & pajak UMKM</p>
                  <div className="space-y-2 w-full">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-left" style={{ color: '#94A3B8' }}>Pengetahuan</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <SuggestionChip key={s.text} {...s} onClick={() => { setInput(s.text); inputRef.current?.focus() }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-left pt-1" style={{ color: '#94A3B8' }}>Data keuangan saya</p>
                    <div className="flex flex-wrap gap-2">
                      {FINANCIAL_SUGGESTIONS.map((s) => (
                        <SuggestionChip key={s.text} {...s} emerald onClick={() => { setInput(s.text); inputRef.current?.focus() }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] ${msg.role === 'user'
                      ? 'text-white rounded-2xl rounded-br-md px-4 py-3'
                      : 'rounded-2xl rounded-bl-md px-4 py-3'
                    }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                    } : {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(148, 163, 184, 0.14)',
                      color: '#E2E8F0',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                    {msg.has_financial_data && msg.role === 'assistant' && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34D399' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }}></span>
                          Menggunakan data keuangan Anda
                        </span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                      <span className="text-[10px]" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#64748B' }}>{msg.time}</span>
                      {msg.role === 'assistant' && <CopyButton text={msg.content} />}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
                      <User size={16} />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="p-3" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div className="flex items-center gap-2 rounded-2xl p-1.5 pl-3" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  disabled={loading}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none"
                  style={{ color: '#F1F5F9' }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)' }}
                  aria-label="Kirim"
                >
                  <Send size={15} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8, #2563EB 50%, #3B82F6)',
          boxShadow: '0 10px 34px rgba(59, 130, 246, 0.55), inset 0 1px 1px rgba(255,255,255,0.35)',
          border: '1px solid rgba(147, 197, 253, 0.35)',
        }}
        aria-label="Buka chatbot"
      >
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(96, 165, 250, 0.55)' }}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {open ? <X size={24} /> : <MessageSquare size={24} />}
          </motion.span>
        </AnimatePresence>
        {unread > 0 && !open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: '#EF4444', boxShadow: '0 0 0 2px #0B1220' }}
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}

function SuggestionChip({ text, icon, emerald, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-medium"
      style={emerald
        ? { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#34D399' }
        : { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.14)', color: '#E2E8F0' }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </motion.button>
  )
}
