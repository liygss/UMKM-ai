import { createContext, useContext, useState, useEffect } from 'react'
import client, { setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // Verify cookie session on mount
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      localStorage.removeItem('user')
    })
    const verifySession = async () => {
      try {
        const { data } = await client.get('/auth/me')
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      } catch {
        setUser(null)
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }
    verifySession()
  }, [])

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    // Token is set as httpOnly cookie by the server — no localStorage needed
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const register = async (email, password, full_name, company_name) => {
    const { data } = await client.post('/auth/register', { email, password, full_name, company_name })
    return data
  }

  const logout = async () => {
    try {
      await client.post('/auth/logout')
    } catch {
      // Ignore errors — clear locally regardless
    }
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
