import { useState } from 'react'
import { motion } from 'motion/react'
import { Bot, Copy, Check } from 'lucide-react'

function renderInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold" style="color: var(--color-slate-heading)">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em style="color: var(--color-slate-text)">$1</em>')
    .replace(/`(.*?)`/g, '<code class="rounded-lg px-1.5 py-0.5 text-xs font-mono" style="background: rgba(59, 130, 246, 0.15); color: var(--color-accent-blue)">$1</code>')
    .replace(/\*/g, '')
}

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
          <pre key={`code-${i}`} className="my-2 rounded-xl p-3 text-xs overflow-x-auto" style={{ background: '#070E1C', color: '#D7E3F4', border: '1px solid var(--color-border-subtle)' }}>
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

    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      i--
      const table = parseTable(tableLines)
      if (table) {
        result.push(<Table key={`tbl-${i}`} data={table} />)
      }
      continue
    }

    let processed = line
      .replace(/^[-•*] (.*$)/gm, '<li class="ml-4" style="color: var(--color-slate-text)">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4" style="color: var(--color-slate-text)"><span class="font-semibold" style="color: var(--color-accent-blue)">$1.</span> $2</li>')

    processed = renderInline(processed)

    if (processed.includes('<li')) {
      result.push(<div key={`li-${i}`} className="my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />)
    } else if (line.startsWith('> ')) {
      result.push(
        <blockquote key={`q-${i}`} className="my-1.5 rounded-r-lg border-l-2 pl-3 py-1 pr-2 text-sm" style={{ borderColor: 'var(--color-accent-blue)', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--color-slate-body)' }} dangerouslySetInnerHTML={{ __html: processed.replace(/^&gt; /, '') }} />
      )
    } else if (line.startsWith('#### ')) {
      result.push(<h4 key={`h4-${i}`} className="text-sm font-bold mt-2 mb-1" style={{ color: 'var(--color-slate-heading)' }} dangerouslySetInnerHTML={{ __html: processed.slice(5) }} />)
    } else if (line.startsWith('### ')) {
      result.push(<h3 key={`h3-${i}`} className="text-base font-bold mt-2 mb-1" style={{ color: 'var(--color-slate-heading)' }} dangerouslySetInnerHTML={{ __html: processed.slice(4) }} />)
    } else if (line.startsWith('# ')) {
      result.push(<h1 key={`h-${i}`} className="text-lg font-bold mt-3 mb-1" style={{ color: 'var(--color-slate-heading)' }} dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />)
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={`h-${i}`} className="text-base font-bold mt-2 mb-1" style={{ color: 'var(--color-slate-heading)' }} dangerouslySetInnerHTML={{ __html: processed.slice(3) }} />)
    } else {
      result.push(<p key={`p-${i}`} className="text-sm leading-relaxed my-0.5" style={{ color: 'var(--color-slate-text)' }} dangerouslySetInnerHTML={{ __html: processed }} />)
    }
  }

  return result
}

function splitTableRow(row) {
  let cells = []
  let current = ''
  let inCode = false
  for (const ch of row) {
    if (ch === '`') inCode = !inCode
    if (ch === '|' && !inCode) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function parseTable(lines) {
  if (lines.length < 1) return null
  const header = splitTableRow(lines[0].replace(/^\|/, '').replace(/\|$/, ''))
  let bodyIndex = 1
  if (lines.length > 1 && /^[\s|:-]+$/.test(lines[1].replace(/\|/g, ''))) {
    bodyIndex = 2
  }
  const rows = []
  for (let i = bodyIndex; i < lines.length; i++) {
    const cells = splitTableRow(lines[i].replace(/^\|/, '').replace(/\|$/, ''))
    rows.push(cells)
  }
  return { header, rows }
}

function Table({ data }) {
  const { header, rows } = data
  return (
    <div className="my-2 overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
            {header.map((h, idx) => (
              <th key={idx} className="px-3 py-1.5 text-left font-bold whitespace-nowrap" style={{ color: 'var(--color-slate-heading)', borderBottom: '1px solid rgba(148, 163, 184, 0.25)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={rIdx % 2 ? { background: 'rgba(148, 163, 184, 0.05)' } : undefined}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-1.5 align-top" style={{ color: 'var(--color-slate-text)', borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }} dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
      <div className="rounded-2xl rounded-bl-md px-5 py-4" style={{ background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.14)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: '#2563EB' }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: 'var(--color-brand-soft)' }} />
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
    <button onClick={handleCopy} className="p-1 rounded-lg transition hover:bg-white/10" style={{ color: 'var(--color-slate-muted)' }} title="Salin pesan">
      {copied ? <Check size={12} style={{ color: '#10B981' }} /> : <Copy size={12} />}
    </button>
  )
}