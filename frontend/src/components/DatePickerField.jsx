import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import id from 'date-fns/locale/id'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('id', id)

export default function DatePickerField({
  value,
  onChange,
  label,
  placeholder = 'Pilih tanggal',
  required = false,
  maxDate,
  minDate,
  className = '',
  disabled = false,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  const handleChange = (date) => {
    if (!date) {
      onChange('')
      setIsOpen(false)
      return
    }
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left })
    }
  }, [isOpen])

  const displayText = selectedDate
    ? selectedDate.toLocaleDateString('id-ID', compact
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' })
    : placeholder

  const calendarPopup = isOpen ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface-2)',
          borderRadius: '1rem',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          border: '1px solid var(--color-border-soft)',
          overflow: 'hidden',
        }}
      >
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          inline
          locale="id"
          dateFormat="dd MMMM yyyy"
          maxDate={maxDate}
          minDate={minDate}
          required={required}
        />
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && <label className="label">{label}</label>}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`input-field cursor-pointer flex items-center justify-between !pr-3 ${compact ? '!py-2 !px-3 text-xs' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate ${selectedDate ? '' : 'text-[var(--color-slate-muted)]'}`}>
          {displayText}
        </span>
        <svg className="w-4 h-4 shrink-0 ml-2" style={{ color: 'var(--color-slate-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      {calendarPopup}
    </div>
  )
}
