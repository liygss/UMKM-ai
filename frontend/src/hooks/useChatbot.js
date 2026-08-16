import { useState, useCallback, useRef } from 'react'
import client from '../api/client'

function formatTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function useChatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const sessionRef = useRef(null)

  const send = useCallback(async (text = input) => {
    const message = (text ?? '').trim()
    if (!message || loading) return false
    setMessages(prev => [...prev, { role: 'user', content: message, time: formatTime() }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await client.post('/chatbot/ask', { message, session_id: sessionRef.current })
      sessionRef.current = data.session_id
      setSessionId(data.session_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        has_financial_data: data.has_financial_data,
        time: formatTime(),
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Pastikan Ollama sedang berjalan.', time: formatTime() }])
    } finally {
      setLoading(false)
    }
    return true
  }, [input, loading])

  const reset = useCallback(() => {
    setMessages([])
    setSessionId(null)
    sessionRef.current = null
  }, [])

  const setSuggestion = useCallback((text) => {
    setInput(text)
  }, [])

  return { messages, setMessages, input, setInput, sessionId, loading, send, reset, setSuggestion }
}
