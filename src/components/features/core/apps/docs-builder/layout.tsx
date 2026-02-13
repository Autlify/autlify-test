'use client'

import { ReactNode } from 'react'
import { type Scope } from '@/types/core'

type Props = {
  children: React.ReactNode
  scope: Scope
}

const Layout = ({
  children,
  scope
}: Props) => {
  return (
    <div className="document-builder-app min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Document Builder
            </h1>
            <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {scope.kind === 'agency' ? 'Agency' : 'Subaccount'}  ID: {scope.kind === 'agency' ? scope.agencyId : scope.subAccountId}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              New Document
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
              Templates
            </button>
          </div>
        </div>
      </header>

      {/* App Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default Layout
