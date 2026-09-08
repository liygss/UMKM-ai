import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ChatbotPage from './pages/ChatbotPage'
import AccountingPage from './pages/AccountingPage'
import JurnalPage from './pages/JurnalPage'
import ReportsPage from './pages/ReportsPage'
import UploadPage from './pages/UploadPage'
import TaxPage from './pages/TaxPage'
import SptPage from './pages/SptPage'
import KnowledgePage from './pages/KnowledgePage'
import NotifAdminPage from './pages/NotifAdminPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import FeedbackPage from './pages/FeedbackPage'
import AdminFeedbackPage from './pages/AdminFeedbackPage'
import DemoPage from './pages/DemoPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
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
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/akun" element={<AccountingPage />} />
        <Route path="/jurnal" element={<JurnalPage />} />
        <Route path="/laporan" element={<ReportsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/pajak" element={<TaxPage />} />
        <Route path="/spt" element={<SptPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/notif-admin" element={<NotifAdminPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
