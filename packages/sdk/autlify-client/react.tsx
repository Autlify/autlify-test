'use client'

import React, { createContext, useContext, useMemo } from 'react'

export type AutlifyProviderConfig = {
  /** Base API prefix (default: /api/features/core) */
  apiBasePath?: string
  /** Optional UI scope for session-based fetch calls (sent as query params) */
  agencyId?: string
  subAccountId?: string
}

const AutlifyReactContext = createContext<Required<AutlifyProviderConfig> | null>(null)

export function AutlifyProvider(props: React.PropsWithChildren<AutlifyProviderConfig>) {
  const value = useMemo<Required<AutlifyProviderConfig>>(
    () => ({
      apiBasePath: props.apiBasePath ?? '/api/features/core',
      agencyId: props.agencyId ?? '',
      subAccountId: props.subAccountId ?? '',
    }),
    [props.apiBasePath, props.agencyId, props.subAccountId]
  )

  return <AutlifyReactContext.Provider value={value}>{props.children}</AutlifyReactContext.Provider>
}

export function useAutlify() {
  const ctx = useContext(AutlifyReactContext)
  if (!ctx) {
    return { apiBasePath: '/api/features/core', agencyId: '', subAccountId: '' } as Required<AutlifyProviderConfig>
  }
  return ctx
}

/** Builds the scope query string used by session-based UI calls (fallback when scope headers are absent). */
export function useAutlifyScopeQuery() {
  const { agencyId, subAccountId } = useAutlify()
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (agencyId) p.set('agencyId', agencyId)
    if (subAccountId) p.set('subAccountId', subAccountId)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [agencyId, subAccountId])
  return qs
}
