'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

export function AlertsSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-fg-primary">Alerts & Notifications</h2>
        <p className="text-fg-secondary">
          Alert components using semantic design system tokens.
        </p>
      </div>

      <div className="space-y-4">
        {/* Default Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is a default alert using design system colors. It inherits border and background from tokens.
          </AlertDescription>
        </Alert>

        {/* Success Alert */}
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-400">Success</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>

        {/* Warning Alert */}
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">Warning</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-300">
            Please review your settings before continuing.
          </AlertDescription>
        </Alert>

        {/* Destructive Alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  )
}
