import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import FloatingChatbot from './FloatingChatbot'
import DemoWelcomeModal from './DemoWelcomeModal'
import NotificationsDropdown from './NotificationsDropdown'
import ThemeToggle from './ThemeToggle'
import GuidedTour from './GuidedTour'
import CommandPalette from './CommandPalette'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { TOUR_STORAGE_PREFIX } from '../data/tourSteps'
import { Menu, Search, Download, CircleHelp } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/chatbot': 'Chatbot',
  '/akun': 'Akun (COA)',
  '/jurnal': 'Jurnal Umum',
  '/laporan': 'Laporan Keuangan',
  '/upload': 'Upload File',
  '/pajak': 'Kalkulator Pajak',
  '/spt': 'SPT Tahunan PPh OP',
  '/notif-admin': 'Kirim Notifikasi',
  '/admin': 'Dashboard Admin',
}

export default function Layout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [key, setKey] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadFile, setDownloadFile] = useState('')
  const [tourOpen, setTourOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[location.pathname] || 'Dashboard'

  useEffect(() => {
    setKey(k => k + 1)
  }, [location.pathname])

  useEffect(() => {
    if (!localStorage.getItem('demo_seen')) setShowWelcome(true)
  }, [])

  // Tampilkan tutorial singkat pada login pertama (per user, per peramban).
  // Tunggu hingga modal selamat datang tertutup agar tidak saling bertumpuk.
  useEffect(() => {
    if (!user?.id) return
    if (showWelcome) return
    try {
      const seen = localStorage.getItem(TOUR_STORAGE_PREFIX + user.id)
      if (seen === 'true') return
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setTourOpen(true), 900)
    return () => clearTimeout(t)
  }, [user?.id, showWelcome])

  // Pintasan keyboard ⌘K / Ctrl+K untuk membuka pencarian.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const startTour = () => {
    if (user?.id) {
      try {
        localStorage.removeItem(TOUR_STORAGE_PREFIX + user.id)
      } catch {
        /* ignore */
      }
    }
    setTourOpen(true)
  }

  useEffect(() => {
    const platform = navigator.platform.toLowerCase()
    const isMac = platform.includes('mac')
    const isWin = platform.includes('win')
    const ext = isMac ? '.dmg' : isWin ? '.exe' : '.AppImage'
    const name = isMac ? 'AI.Accounting.RAG-1.0.0-arm64.dmg'
      : isWin ? 'AI.Accounting.RAG.Setup.1.0.0.exe'
      : 'AI.Accounting.RAG-1.0.0.AppImage'

    client.get('/downloads')
      .then(r => {
        const files = Array.isArray(r.data) ? r.data : []
        if (files.some(f => f.endsWith(ext))) {
          setDownloadUrl(`/api/downloads/${encodeURIComponent(name)}`)
          setDownloadFile(name)
        }
      })
      .catch(() => {})
  }, [])

  const closeWelcome = (launch) => {
    localStorage.setItem('demo_seen', 'true')
    setShowWelcome(false)
    if (launch) navigate('/demo')
  }

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="relative z-40 flex h-18 items-center gap-4 px-4 lg:px-6" style={{ background: 'var(--color-header-bg)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(148, 163, 184, 0.14)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 rounded-xl transition-all duration-300 hover:bg-white/5" style={{ color: 'var(--color-slate-body)' }}>
            <Menu size={20} />
          </button>

          {/* Logo - Mobile */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden" style={{ borderRadius: '0.75rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              <img src="/finora_logo.jpeg" alt="Finora" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-slate-heading)' }}>Finora</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <button data-tour="header-search" onClick={() => setSearchOpen(true)} className="hidden md:flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 cursor-pointer w-56 hover:shadow-md" style={{ background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.14)', color: 'var(--color-slate-muted)' }}>
              <Search size={14} />
              <span>Cari...</span>
              <kbd className="ml-auto rounded-lg px-2 py-0.5 text-[10px] font-medium" style={{ background: 'var(--color-surface-card)', border: '1px solid rgba(148, 163, 184, 0.18)', color: 'var(--color-slate-muted)' }}>⌘K</kbd>
            </button>

            {/* Download Desktop App */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={downloadFile}
                className="hidden sm:flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10B981)',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
                title={`Download ${downloadFile}`}
              >
                <Download size={14} />
                <span className="hidden lg:inline">Download App</span>
              </a>
            )}

            {/* Notification bell */}
            <NotificationsDropdown />

            {/* Tutorial / Bantuan */}
            <button
              onClick={startTour}
              title="Tutorial penggunaan"
              aria-label="Buka tutorial"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
              style={{ background: 'var(--color-surface-faint)', border: '1px solid var(--color-border-soft)', color: 'var(--color-slate-body)' }}
            >
              <CircleHelp size={18} />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Brand badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(59, 130, 246, 0.14)', color: 'var(--color-accent-blue)', border: '1px solid rgba(96, 165, 250, 0.28)' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-brand-soft)' }} />
              Finora
            </div>
          </div>
        </header>

        {/* Main content with page transition */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div key={key} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {showWelcome && <DemoWelcomeModal onClose={() => closeWelcome(false)} onLaunch={() => closeWelcome(true)} />}
      <FloatingChatbot />
      <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
