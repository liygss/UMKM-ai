import { motion } from 'motion/react'
import { Bot, RotateCcw } from 'lucide-react'
import useChatbot from '../hooks/useChatbot'
import AssistantChat from '../components/AssistantChat'
import { fadeUp } from '../utils/motionPresets'

export default function ChatbotPage() {
  const { messages, input, setInput, loading, send, reset } = useChatbot()

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  return (
    <div className="space-y-5">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB 55%, #3B82F6)', boxShadow: '0 6px 20px var(--color-brand-glow), inset 0 1px 1px rgba(255,255,255,0.35)' }}
        >
          <Bot size={20} />
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold" style={{ color: 'var(--color-slate-heading)' }}>
            Asisten Finora
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-emerald)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#10B981' }} />
              Online
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-slate-body)' }}>Tanya apa saja seputar akuntansi & pajak UMKM</p>
        </div>
        <motion.button
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onClick={reset}
          title="Mulai percakapan baru"
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition hover:scale-105"
          style={{ color: 'var(--color-slate-body)', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}
        >
          <RotateCcw size={14} />
          Percakapan baru
        </motion.button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col overflow-hidden rounded-[26px] h-[calc(100vh-11rem)] min-h-[420px]"
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
          autoFocus
          hideHeader
        />
      </motion.div>
    </div>
  )
}