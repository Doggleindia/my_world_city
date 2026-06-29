'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

const SavedCtx = createContext(null)

export function useSaved() {
  const ctx = useContext(SavedCtx)
  if (!ctx) throw new Error('useSaved must be used inside <SavedProvider>')
  return ctx
}

export function SavedProvider({ children }) {
  const { user, requireAuth } = useAuth()
  const [ids, setIds] = useState(() => new Set())

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set())
      return
    }
    try {
      const res = await fetch('/api/saved')
      const data = await res.json()
      if (res.ok) setIds(new Set(data.ids))
    } catch {
      /* ignore */
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isSaved = useCallback((id) => ids.has(String(id)), [ids])

  // Optimistic toggle; prompts login if needed.
  const toggle = useCallback(
    (id) => {
      requireAuth(async () => {
        const key = String(id)
        const currentlySaved = ids.has(key)
        setIds((prev) => {
          const next = new Set(prev)
          currentlySaved ? next.delete(key) : next.add(key)
          return next
        })
        try {
          await fetch(currentlySaved ? `/api/saved?propertyId=${key}` : '/api/saved', {
            method: currentlySaved ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: currentlySaved ? undefined : JSON.stringify({ propertyId: key }),
          })
        } catch {
          refresh() // reconcile on failure
        }
      })
    },
    [ids, requireAuth, refresh],
  )

  return (
    <SavedCtx.Provider value={{ ids, isSaved, toggle, refresh }}>{children}</SavedCtx.Provider>
  )
}
