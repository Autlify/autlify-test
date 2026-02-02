'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

type SidebarContextType = {
  isCollapsed: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
  title: string
  setTitle: (title: string) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children, defaultCollapsed = false }: { children: ReactNode; defaultCollapsed?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [title, setTitleState] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
  }, [])

  const setCollapsed = useCallback((value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }, [])

  const toggle = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle)
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed, toggle, title, setTitle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
