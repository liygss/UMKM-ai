import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useChatbotShared } from '../context/ChatbotContext'
import AssistantChat from './AssistantChat'

const WIDTH_KEY = 'ask_finora_width'
const COLLAPSED_KEY = 'ask_finora_collapsed'
const MIN_WIDTH = 300
const MAX_WIDTH = 420
const DEFAULT_WIDTH = 340

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

/**
 * Panel "Ask Finora" — bisa di-collapse/expand.
 *
 * - Default: collapsed (hanya ikon floating di pojok kanan bawah).
 * - Klik ikon → expand panel penuh di sisi kanan.
 * - Bisa di-resize, width tersimpan di localStorage.
 * - Sembunyi di layar kecil (< md) secara default.
 * - Event `open-chatbot` (dari "Tanya AI" di Dashboard) mem-expand + fokus input.
 */
export default function AskFinoraPanel() {
  const [width, setWidth] = useState(() => {
    const saved = parseFloat(localStorage.getItem(WIDTH_KEY))
    return Number.isFinite(saved) ? clamp(saved, MIN_WIDTH, MAX_WIDTH) : DEFAULT_WIDTH
  })
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(COLLAPSED_KEY)
    // Default: terbuka (false). User bisa tutup manual.
    return saved !== null ? saved === 'true' : false
  })
  const [dragging, setDragging] = useState(false)
  const [focusSignal, setFocusSignal] = useState(0)
  const { messages, input, setInput, loading, send, sendFollowUp, uploadAndParse, createDataset, confirmTransaction, rejectTransaction, reset, followUpSuggestions, pendingFile, setPendingFile, removePendingFile } = useChatbotShared()

  // Persist collapsed state
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, String(collapsed)) } catch { /* ignore */ }
  }, [collapsed])

  // Buka/fokus dari mana saja (Quick Action "Tanya AI" di dashboard).
  useEffect(() => {
    const onFocus = () => {
      setCollapsed(false)
      setFocusSignal(n => n + 1)
    }
    window.addEventListener('open-chatbot', onFocus)
    return () => window.removeEventListener('open-chatbot', onFocus)
  }, [])

  const togglePanel = useCallback(() => {
    setCollapsed(c => !c)
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  const startResize = (e) => {
    e.preventDefault()
    setDragging(true)
    const startX = e.clientX
    const startWidth = width
    const onMove = (ev) => {
      ev.preventDefault()
      setWidth(clamp(startWidth + (startX - ev.clientX), MIN_WIDTH, MAX_WIDTH))
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      setWidth(w => {
        const next = clamp(w, MIN_WIDTH, MAX_WIDTH)
        try {
          localStorage.setItem(WIDTH_KEY, String(next))
        } catch { /* ignore */ }
        return next
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    window.addEventListener('pointercancel', onUp, { once: true })
  }

  const hasMessages = messages.length > 0

  return (
    <>
      {/* Floating toggle button — visible when collapsed */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePanel}
            className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center h-14 w-14 rounded-full shadow-2xl transition-colors"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.15)',
            }}
            title="Buka Asisten Finora"
            aria-label="Buka Asisten Finora"
          >
            <div className="relative">
              <MessageCircle size={22} className="text-white" />
              {hasMessages && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full" style={{ background: '#10B981', border: '2px solid #2563EB' }} />
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full panel */}
      <AnimatePresence>
        {!collapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
            style={{
              height: '100%',
              background: 'var(--color-glass-bg)',
              backdropFilter: 'blur(30px) saturate(180%)',
              borderLeft: '1px solid var(--color-border-soft)',
              boxShadow: '-24px 0 60px var(--color-shadow), 0 0 0 1px rgba(59, 130, 246, 0.08)',
            }}
            aria-label="Ask Finora"
          >
            {/* Resize handle */}
            <div
              onPointerDown={startResize}
              className={`absolute -left-1.5 inset-y-0 z-10 flex w-3 cursor-col-resize items-center justify-center select-none ${dragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
              style={{ touchAction: 'none' }}
              title="Seret untuk mengubah lebar"
              role="separator"
              aria-orientation="vertical"
            >
              <span
                className={`h-10 w-1 rounded-full transition-all duration-200 ${dragging ? 'h-16' : ''}`}
                style={{
                  background: dragging ? 'var(--color-brand-soft)' : 'rgba(148, 163, 184, 0.45)',
                  boxShadow: dragging ? '0 0 10px var(--color-brand-glow)' : 'none',
                }}
              />
            </div>

            {/* Header */}
            <header className="relative flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl overflow-hidden" style={{ boxShadow: '0 6px 20px var(--color-brand-glow)' }}>
                  <img src="/assets/buddy/buddy-happy.png" alt="Buddy" className="h-full w-full object-contain" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2" style={{ background: '#10B981', borderColor: 'var(--color-surface-2)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold leading-tight" style={{ color: 'var(--color-slate-heading)' }}>Asisten Finora</div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#10B981' }} />
                  Online
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={reset}
                  className="p-1.5 rounded-lg transition hover:bg-white/5"
                  style={{ color: 'var(--color-slate-muted)' }}
                  title="Mulai percakapan baru"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                onClick={togglePanel}
                className="p-1.5 rounded-lg transition hover:bg-white/5"
                style={{ color: 'var(--color-slate-muted)' }}
                title="Tutup panel"
                aria-label="Tutup panel"
              >
                <X size={16} />
              </button>
            </header>

            {/* Chat */}
            <div className="relative flex-1 overflow-hidden">
              <AssistantChat
                className="h-full"
                messages={messages}
                input={input}
                setInput={setInput}
                loading={loading}
                onSubmit={onSubmit}
                onReset={reset}
                autoFocus
                focusSignal={focusSignal}
                hideHeader
                uploadAndParse={uploadAndParse}
                createDataset={createDataset}
                followUpSuggestions={followUpSuggestions}
                onFollowUp={sendFollowUp}
                onConfirmTransaction={confirmTransaction}
                onRejectTransaction={rejectTransaction}
                pendingFile={pendingFile}
                onRemovePendingFile={removePendingFile}
                onFileSelect={setPendingFile}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
