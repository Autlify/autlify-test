// src/features/apps/resolver.tsx
'use client'

import { useDesktop } from '@/features/desktop/context'
import { redirect } from 'next/navigation'
import type { TenantScope, AppResolverProps } from '@/features/desktop/type'

export function AppResolver({ scope, appKey, path = [], windowId }: AppResolverProps) {
  const { openApp } = useDesktop()

  // Validate that the appKey is allowed in the given scope
  const allowedAppsForScope = getAllowedAppsForScope(scope)
  if (!allowedAppsForScope.includes(appKey)) {
    // Redirect to a safe location if app is not allowed
    redirect(getSafeLandingForScope(scope))
  }

  // Open the app in the desktop context
  openApp(appKey, path)

  return null // This component does not render anything itself
}

function getAllowedAppsForScope(scope: TenantScope): string[] {
  // Example logic: in a real app, this might fetch from a config or permissions system
  if (scope.type === 'AGENCY') {
    return ['integrations', 'fi-gl', 'reports']
  } else if (scope.type === 'SUBACCOUNT') {
    return ['integrations', 'reports']
  }
  return []
}

function getSafeLandingForScope(scope: TenantScope): string {
  if (scope.type === 'AGENCY') {
    return `/agency/${scope.agencyId}/apps`
  } else if (scope.type === 'SUBACCOUNT') {
    return `/subaccount/${scope.subAccountId}/apps`
  }
  return '/apps'
}

export type { TenantScope, AppResolverProps }
