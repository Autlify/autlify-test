import React from 'react'

// Window state
type AppWindow = {
  id: string                    // Unique window instance ID
  appKey: string                // 'integrations' | 'fi-gl' | etc.
  path: string[]                // Sub-route within app
  title: string                 // Window title bar
  state: 'normal' | 'minimized' | 'maximized'
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isPinned?: boolean            // Keep on top
}

export const DesktopContext = React.createContext<Context | undefined>(undefined)

// Desktop context
type Context = {
  windows: AppWindow[]
  activeWindowId: string | null
  
  // Actions
  openApp: (appKey: string, path?: string[]) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, position: { x: number; y: number }) => void
  resizeWindow: (id: string, size: { width: number; height: number }) => void
} 

type TenantScope = 
  | { type: 'AGENCY'; agencyId: string }
  | { type: 'SUBACCOUNT'; subAccountId: string; agencyId?: string }

  type DesktopProviderProps = {
  scope: TenantScope
  children: React.ReactNode
}

type AppResolverProps = {
  scope: TenantScope
  appKey: string
  path?: string[]
  windowId: string
}



export type { AppWindow, Context, TenantScope, DesktopProviderProps, AppResolverProps }