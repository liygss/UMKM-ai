import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, BookOpen, FileText,
  BarChart3, Upload, Calculator, LogOut, X, Landmark,
  ChevronsLeft, ChevronsRight, Database, PlayCircle, FileSpreadsheet, Send
} from 'lucide-react'

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const navSections = [
    {
      label: 'Menu Utama',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Akuntansi',
      items: [
        { to: '/akun', label: 'Akun (COA)', icon: BookOpen },
        { to: '/jurnal', label: 'Jurnal Umum', icon: FileText },
        { to: '/laporan', label: 'Laporan Keuangan', icon: BarChart3 },
      ]
    },
    {
      label: 'Pajak',
      items: [
        { to: '/pajak', label: 'Kalkulator Pajak', icon: Calculator },
        { to: '/spt', label: 'SPT Tahunan (1770/1770S)', icon: FileSpreadsheet },
      ]
    },
    {
      label: 'Lainnya',
      items: [
        { to: '/demo', label: 'Lihat Demo', icon: PlayCircle },
        { to: '/upload', label: 'Upload File', icon: Upload },
        ...(isAdmin ? [{ to: '/knowledge', label: 'Knowledge Base', icon: Database }] : []),
        ...(isAdmin ? [{ to: '/notif-admin', label: 'Kirim Notifikasi', icon: Send }] : []),
      ]
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const width = collapsed ? 'w-[76px]' : 'w-72'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          style={{ background: 'rgba(3, 7, 18, 0.6)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 ${width} transition-all duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
        style={{
          background: 'rgba(10, 16, 30, 0.85)',
          backdropFilter: 'blur(24px) saturate(160%)',
          borderRight: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex h-18 items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-6'}`} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
                boxShadow: '0 4px 18px rgba(59, 130, 246, 0.45)',
              }}
            >
              <Landmark size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <div className="text-sm font-bold tracking-wide" style={{ color: '#F1F5F9' }}>AI UMKM</div>
                <div className="text-xs font-medium" style={{ color: '#93C5FD' }}>Asisten Cerdas</div>
              </div>
            )}
            <button onClick={onClose} className="ml-auto lg:hidden p-1.5 rounded-xl transition-all duration-300 hover:bg-white/5" style={{ color: '#94A3B8' }}>
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
            {navSections.map((section) => (
              <div key={section.label}>
                {!collapsed && (
                  <p className="px-4 mb-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>
                    {section.label}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl transition-all duration-300 ${
                          collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/15 to-blue-400/5 font-semibold text-[#93C5FD] shadow-sm ring-1 ring-blue-500/20'
                            : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#E2E8F0]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full"
                              style={{ background: 'linear-gradient(180deg, #3B82F6, #60A5FA)', boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)' }}
                            />
                          )}
                          <item.icon size={18} className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-[#60A5FA] drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]' : ''}`} />
                          {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex p-2" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-300 hover:bg-white/5 hover:text-[#93C5FD]"
              style={{ color: '#64748B' }}
            >
              {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> <span>Tutup Sidebar</span></>}
            </button>
          </div>

          {/* User section */}
          <div className={`p-4 ${collapsed ? 'px-2' : 'px-5'}`} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              <div className="relative shrink-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  {user?.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full" style={{ background: '#10B981', border: '2px solid #0A101E' }} />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1 animate-fade-in">
                  <div className="text-sm font-semibold truncate" style={{ color: '#F1F5F9' }}>{user?.full_name}</div>
                  <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{user?.email}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 ${collapsed ? 'justify-center' : ''}`}
              style={{ color: '#94A3B8' }}
              title={collapsed ? 'Keluar' : undefined}
            >
              <LogOut size={16} />
              {!collapsed && 'Keluar'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
