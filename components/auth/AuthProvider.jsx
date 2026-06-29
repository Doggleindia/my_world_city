'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import LoginModal from './LoginModal'

const AuthCtx = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const pendingRef = useRef(null) // action to run after a successful login

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Run `cb` if logged in, otherwise open the login modal and run it afterwards.
  const requireAuth = useCallback(
    (cb) => {
      if (user) {
        cb?.()
      } else {
        pendingRef.current = cb ?? null
        setLoginOpen(true)
      }
    },
    [user],
  )

  const openLogin = useCallback(() => setLoginOpen(true), [])

  const onAuthed = useCallback((u) => {
    setUser(u)
    setLoginOpen(false)
    const cb = pendingRef.current
    pendingRef.current = null
    cb?.()
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, openLogin, requireAuth, logout, refresh }}>
      {children}
      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false)
          pendingRef.current = null
        }}
        onAuthed={onAuthed}
      />
    </AuthCtx.Provider>
  )
}
