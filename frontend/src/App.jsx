import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AccountingPage from './pages/AccountingPage'
import JurnalPage from './pages/JurnalPage'
import ReportsPage from './pages/ReportsPage'
import UploadPage from './pages/UploadPage'
import TaxPage from './pages/TaxPage'
import SptPage from './pages/SptPage'
import KnowledgePage from './pages/KnowledgePage'
import DemoPage from './pages/DemoPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/akun" element={<AccountingPage />} />
        <Route path="/jurnal" element={<JurnalPage />} />
        <Route path="/laporan" element={<ReportsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/pajak" element={<TaxPage />} />
        <Route path="/spt" element={<SptPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
