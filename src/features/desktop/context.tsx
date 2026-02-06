// src/features/desktop/context.tsx
'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import type { TenantScope } from '@/features/desktop/type'

type AppWindow = {
  id: string
  appKey: string
  path: string[]
  title: string
  state: 'normal' | 'minimized' | 'maximized'
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

type DesktopState = {
  windows: AppWindow[]
  activeWindowId: string | null
  nextZIndex: number
}

type DesktopAction =
  | { type: 'OPEN_APP'; appKey: string; path?: string[]; title?: string }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'MAXIMIZE_WINDOW'; id: string }
  | { type: 'RESTORE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; position: { x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; id: string; size: { width: number; height: number } }
  | { type: 'NAVIGATE_WINDOW'; id: string; path: string[] }

function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case 'OPEN_APP': {
      // Check if app already open
      const existing = state.windows.find(w => w.appKey === action.appKey)
      if (existing) {
        return {
          ...state,
          activeWindowId: existing.id,
          windows: state.windows.map(w =>
            w.id === existing.id
              ? { ...w, state: 'normal', zIndex: state.nextZIndex }
              : w
          ),
          nextZIndex: state.nextZIndex + 1,
        }
      }
      
      const id = `${action.appKey}-${Date.now()}`
      const newWindow: AppWindow = {
        id,
        appKey: action.appKey,
        path: action.path ?? [],
        title: action.title ?? action.appKey,
        state: 'normal',
        position: { x: 100 + state.windows.length * 30, y: 100 + state.windows.length * 30 },
        size: { width: 900, height: 600 },
        zIndex: state.nextZIndex,
      }
      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.id),
        activeWindowId: state.activeWindowId === action.id ? null : state.activeWindowId,
      }

    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, state: 'minimized' } : w
        ),
      }

    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, state: 'maximized', zIndex: state.nextZIndex } : w
        ),
        activeWindowId: action.id,
        nextZIndex: state.nextZIndex + 1,
      }

    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, state: 'normal', zIndex: state.nextZIndex } : w
        ),
        activeWindowId: action.id,
        nextZIndex: state.nextZIndex + 1,
      }

    case 'FOCUS_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        activeWindowId: action.id,
        nextZIndex: state.nextZIndex + 1,
      }

    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, position: action.position } : w
        ),
      }

    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, size: action.size } : w
        ),
      }

    case 'NAVIGATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, path: action.path } : w
        ),
      }

    default:
      return state
  }
}

const DesktopContext = createContext<{
  state: DesktopState
  scope: TenantScope
  dispatch: React.Dispatch<DesktopAction>
} | null>(null)

export function DesktopProvider({ 
  scope, 
  children 
}: { 
  scope: TenantScope
  children: React.ReactNode 
}) {
  const [state, dispatch] = useReducer(desktopReducer, {
    windows: [],
    activeWindowId: null,
    nextZIndex: 1,
  })

  return (
    <DesktopContext.Provider value={{ state, scope, dispatch }}>
      {children}
    </DesktopContext.Provider>
  )
}

export function useDesktop() {
  const ctx = useContext(DesktopContext)
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider')
  
  const { state, scope, dispatch } = ctx

  return {
    windows: state.windows,
    activeWindowId: state.activeWindowId,
    scope,
    
    openApp: useCallback((appKey: string, path?: string[], title?: string) => {
      dispatch({ type: 'OPEN_APP', appKey, path, title })
    }, [dispatch]),
    
    closeWindow: useCallback((id: string) => {
      dispatch({ type: 'CLOSE_WINDOW', id })
    }, [dispatch]),
    
    minimizeWindow: useCallback((id: string) => {
      dispatch({ type: 'MINIMIZE_WINDOW', id })
    }, [dispatch]),
    
    maximizeWindow: useCallback((id: string) => {
      dispatch({ type: 'MAXIMIZE_WINDOW', id })
    }, [dispatch]),
    
    restoreWindow: useCallback((id: string) => {
      dispatch({ type: 'RESTORE_WINDOW', id })
    }, [dispatch]),
    
    focusWindow: useCallback((id: string) => {
      dispatch({ type: 'FOCUS_WINDOW', id })
    }, [dispatch]),
    
    moveWindow: useCallback((id: string, position: { x: number; y: number }) => {
      dispatch({ type: 'MOVE_WINDOW', id, position })
    }, [dispatch]),
    
    resizeWindow: useCallback((id: string, size: { width: number; height: number }) => {
      dispatch({ type: 'RESIZE_WINDOW', id, size })
    }, [dispatch]),
    
    navigateWindow: useCallback((id: string, path: string[]) => {
      dispatch({ type: 'NAVIGATE_WINDOW', id, path })
    }, [dispatch]),
  }
}