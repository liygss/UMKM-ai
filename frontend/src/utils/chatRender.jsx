import { useState } from 'react'
import { motion } from 'motion/react'
import { Bot, Copy, Check } from 'lucide-react'

export function renderMarkdown(text) {
  if (!text) return null
  let lines = text.split('\n')
  let result = []
  let inCodeBlock = false
  let codeLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        result.push(
          <pre key={`code-${i}`} className="my-2 rounded-xl p-3 text-xs overflow-x-auto" style={{ background: '#1F2937', color: '#F9FAFB' }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (line.trim() === '') {
      result.push(<br key={`br-${i}`} />)
      continue
    }

    let processed = line
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold" style="color: #F1F5F9">$1</strong>')
      .replace(/`(.*?)`/g, '<code class="rounded-lg px-1.5 py-0.5 text-xs font-mono" style="background: rgba(59, 130, 246, 0.15); color: #93C5FD">$1</code>')
      .replace(/^[-•] (.*$)/gm, '<li class="ml-4" style="color: #CBD5E1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4" style="color: #CBD5E1"><span class="font-semibold" style="color: #93C5FD">$1.</span> $2</li>')

    if (processed.includes('<li')) {
      result.push(<div key={`li-${i}`} className="my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />)
    } else if (line.startsWith('# ')) {
      result.push(<h1 key={`h-${i}`} className="text-lg font-bold mt-3 mb-1" style={{ color: '#F1F5F9' }} dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />)
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={`h-${i}`} className="text-base font-bold mt-2 mb-1" style={{ color: '#F1F5F9' }} dangerouslySetInnerHTML={{ __html: processed.slice(3) }} />)
    } else {
      result.push(<p key={`p-${i}`} className="text-sm leading-relaxed my-0.5" style={{ color: '#CBD5E1' }} dangerouslySetInnerHTML={{ __html: processed }} />)
    }
  }

  return result
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
        }}
      >
        <Bot size={16} />
      </div>
      <div className="rounded-2xl rounded-bl-md px-5 py-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.14)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: '#2563EB' }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: '#60A5FA' }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: '#1D4ED8' }} />
        </div>
      </div>
    </motion.div>
  )
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="p-1 rounded-lg transition hover:bg-white/10" style={{ color: '#64748B' }} title="Salin pesan">
      {copied ? <Check size={12} style={{ color: '#10B981' }} /> : <Copy size={12} />}
    </button>
  )
}
