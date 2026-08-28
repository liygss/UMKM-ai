import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, X } from 'lucide-react'
import useChatbot from '../hooks/useChatbot'
import AssistantChat from './AssistantChat'

export default function FloatingChatbot() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { messages, input, setInput, loading, send, reset } = useChatbot()
  const [unread, setUnread] = useState(0)
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

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  if (location.pathname === '/chatbot') return null

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
            className="relative flex h-[540px] max-h-[72vh] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-[26px]"
            style={{
              background: 'var(--color-glass-bg)',
              backdropFilter: 'blur(28px) saturate(170%)',
              border: '1px solid var(--color-border-soft)',
              boxShadow: '0 28px 70px var(--color-shadow), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            }}
          >
            <AssistantChat
              className="h-full"
              messages={messages}
              input={input}
              setInput={setInput}
              loading={loading}
              onSubmit={onSubmit}
              onReset={reset}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        data-tour="chatbot-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8, #2563EB 50%, #3B82F6)',
          boxShadow: '0 10px 34px var(--color-brand-glow), inset 0 1px 1px rgba(255,255,255,0.35)',
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
            style={{ background: '#EF4444', boxShadow: '0 0 0 2px var(--color-surface-0)' }}
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}