'use client'
import { create } from 'zustand'
import { mockUsers } from './mockData'
import type { User } from './types'

interface AppStore {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

function loadState() {
  if (typeof window === 'undefined') return { currentUser: null, isAuthenticated: false }
  try {
    const raw = localStorage.getItem('acai_auth')
    if (raw) {
      const { userId } = JSON.parse(raw)
      const user = mockUsers.find(u => u.id === userId) ?? null
      return { currentUser: user, isAuthenticated: !!user }
    }
  } catch {}
  return { currentUser: null, isAuthenticated: false }
}

export const useAppStore = create<AppStore>((set) => ({
  ...loadState(),
  login: (email: string, _password: string) => {
    const user = mockUsers.find(u => u.email === email) ?? mockUsers[0]
    set({ currentUser: user, isAuthenticated: true })
    if (typeof window !== 'undefined') {
      localStorage.setItem('acai_auth', JSON.stringify({ userId: user.id }))
    }
    return true
  },
  logout: () => {
    set({ currentUser: null, isAuthenticated: false })
    if (typeof window !== 'undefined') localStorage.removeItem('acai_auth')
  },
}))
