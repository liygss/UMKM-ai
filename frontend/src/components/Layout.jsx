import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import FloatingChatbot from './FloatingChatbot'
import DemoWelcomeModal from './DemoWelcomeModal'
import NotificationsDropdown from './NotificationsDropdown'
import client from '../api/client'
import { Menu, Search, Landmark, Download } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/akun': 'Akun (COA)',
  '/jurnal': 'Jurnal Umum',
  '/laporan': 'Laporan Keuangan',
  '/upload': 'Upload File',
  '/pajak': 'Kalkulator Pajak',
  '/spt': 'SPT Tahunan PPh OP',
  '/notif-admin': 'Kirim Notifikasi',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [key, setKey] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadFile, setDownloadFile] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[location.pathname] || 'Dashboard'

  useEffect(() => {
    setKey(k => k + 1)
  }, [location.pathname])

  useEffect(() => {
    if (!localStorage.getItem('demo_seen')) setShowWelcome(true)
  }, [])

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
        <header className="flex h-18 items-center gap-4 px-4 lg:px-6" style={{ background: 'rgba(11, 18, 32, 0.72)', backdropFilter: 'blur(20px) saturate(160%)', borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 rounded-xl transition-all duration-300 hover:bg-[#EFF6FF]/10" style={{ color: '#94A3B8' }}>
            <Menu size={20} />
          </button>

          {/* Logo - Mobile */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              <Landmark size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>AI UMKM</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 cursor-pointer w-56 hover:shadow-md" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(148, 163, 184, 0.14)', color: '#64748B' }}>
              <Search size={14} />
              <span>Cari...</span>
              <kbd className="ml-auto rounded-lg px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.18)', color: '#64748B' }}>⌘K</kbd>
            </div>

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

            {/* Brand badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#60A5FA' }} />
              AI UMKM
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
    </div>
  )
}
