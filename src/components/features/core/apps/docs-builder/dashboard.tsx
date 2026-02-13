'use client'

import { useState, useEffect } from 'react'
import type { Scope } from '@/types/core'

type Status = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'

interface DocumentTemplate {
  id: string
  name: string
  category: string
  description?: string
  isSystem: boolean
  version: number
  updatedAt: Date
  createdAt: Date
}

interface Document {
  id: string
  title: string
  status: Status
  version: number
  createdAt: Date
  updatedAt: Date
}

interface DocumentWithTemplate extends Document {
  template: DocumentTemplate | null
}

type Props = {
  scope: Scope
}

const Dashboard = ({ scope }: Props) => {
  const [documents, setDocuments] = useState<DocumentWithTemplate[]>([])
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents')

  // Permission checks (simplified for demo)
  const canCreateDocument = true
  const canCreateTemplate = true

  const scopeId = scope.kind === 'agency' ? scope.agencyId : scope.subAccountId

  // Load documents and templates
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load documents for this context
        const documentsResponse = await fetch(`/api/apps/document-builder/${scope.kind}/${scopeId}/documents`)
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(Array.isArray(documentsData) ? documentsData : [])
        } else {
          console.error('Failed to fetch documents:', documentsResponse.status)
          setDocuments([])
        }

        // Load templates for this context
        const templatesResponse = await fetch(`/api/apps/document-builder/${scope.kind}/${scopeId}/templates`)
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json()
          setTemplates(Array.isArray(templatesData) ? templatesData : [])
        } else {
          console.error('Failed to fetch templates:', templatesResponse.status)
          setTemplates([])
        }
      } catch (error) {
        console.error('Failed to load document builder data:', error)
        setError('Failed to load data from API')
        setDocuments([])
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [scope.kind, scopeId])

  const handleCreateDocument = async (templateId?: string) => {
    try {
      const response = await fetch(`/api/apps/document-builder/${scope.kind}/${scopeId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          title: 'Untitled Document'
        })
      })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments(prev => [newDocument, ...prev])
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch(`/api/apps/document-builder/${scope.kind}/${scopeId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Template',
          category: 'invoice',
          content: '<div>Template content</div>'
        })
      })

      if (response.ok) {
        const newTemplate = await response.json()
        setTemplates(prev => [newTemplate, ...prev])
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PUBLISHED': return 'bg-blue-100 text-blue-800'
      case 'ARCHIVED': return 'bg-red-100 text-red-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Demo Mode</h3>
          <p className="text-red-700 mb-4">
            The API endpoints are not fully connected in this demo. This shows the UI structure and data flow.
          </p>
          <div className="text-sm text-red-600">
            <p>Context: {scope.kind} - {scopeId}</p>
            <p>Expected API: /api/apps/document-builder/{scope.kind}/{scopeId}/documents</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Context Information */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              {scope.kind === 'agency' ? 'Agency' : 'Subaccount'} Document Builder
            </h2>
            <p className="text-blue-700">
              Managing documents for {scope.kind} ID: <span className="font-mono">{scopeId}</span>
            </p>
          </div>
          <div className="text-sm text-blue-600">
            Permissions: {canCreateDocument ? '✓ Create' : '✗ Create'} |
            {canCreateDocument ? ' ✓ Edit' : ' ✗ Edit'} |
            {canCreateDocument ? ' ✓ Delete' : ' ✗ Delete'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Templates ({templates.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleCreateDocument()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                disabled={!canCreateDocument}
                aria-label='Create Blank Document'
              >
                Create Blank Document
              </button>
              {templates.length > 0 && (
                <select
                  onChange={(e) => e.target.value && handleCreateDocument(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  defaultValue=""
                  aria-label='Create from Template'
                >
                  <option value="">Create from Template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No documents yet</div>
              <p className="text-gray-500 mb-4">Create your first document to get started</p>
              <button
                onClick={() => handleCreateDocument()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                disabled={!canCreateDocument}
              >
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(document => (
                <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 truncate">{document.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>

                  {document.template && (
                    <p className="text-sm text-gray-600 mb-2">
                      Template: {document.template.name}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Version {document.version} • Created {new Date(document.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium">
                      Edit
                    </button>
                    <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Templates</h3>
            <button
              onClick={handleCreateTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              disabled={!canCreateTemplate}
            >
              Create Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No templates yet</div>
              <p className="text-gray-500 mb-4">Create templates to speed up document creation</p>
              <button
                onClick={handleCreateTemplate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                disabled={!canCreateTemplate}
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${template.isSystem ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {template.isSystem ? 'System' : 'Custom'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 capitalize">{template.category}</p>

                  {template.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Version {template.version} • Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCreateDocument(template.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Use Template
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

Dashboard.displayName = 'Dashboard'

export { Dashboard as Dashboard }