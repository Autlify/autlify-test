'use client'

import { useState } from 'react'
import type { Scope } from '@/types/core'
import { Dashboard } from './dashboard'

interface EInvoiceBuilderProps {
  scope: Scope
}

export function EInvoiceBuilder({ scope }: EInvoiceBuilderProps) {
  const [activeStep, setActiveStep] = useState<'template' | 'content' | 'signature' | 'preview'>('template')

  const scopeId = scope.kind === 'agency' ? scope.agencyId : scope.subAccountId
  const scopeLabel = scope.kind === 'agency' ? 'Agency' : 'Subaccount'

  const steps = [
    { key: 'template', label: 'Select Template', description: 'Choose LHDNM compliant template' },
    { key: 'content', label: 'Document Content', description: 'Fill required fields' },
    { key: 'signature', label: 'Digital Signature', description: 'Add signature pad' },
    { key: 'preview', label: 'Preview & Save', description: 'Review and save to database' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* LHDNM e-Invoice Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg">
        <h1 className="text-3xl font-bold mb-2">LHDNM e-Invoice Builder</h1>
        <p className="text-blue-100">
          Malaysia Digital Government compliant invoice builder with signature pad and required fields
        </p>
        <div className="mt-4 text-sm">
          <span className="bg-blue-500 px-2 py-1 rounded mr-2">Context: {scopeLabel}</span>
          <span className="bg-blue-500 px-2 py-1 rounded">ID: {scopeId}</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex-1 relative ${index < steps.length - 1 ? 'mr-8' : ''}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${activeStep === step.key
                      ? 'bg-blue-600 text-white'
                      : steps.findIndex(s => s.key === activeStep) > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {steps.findIndex(s => s.key === activeStep) > index ? '✓' : index + 1}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${activeStep === step.key ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-10 w-full h-0.5 ${steps.findIndex(s => s.key === activeStep) > index
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                    }`}
                  style={{ right: '-2rem' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeStep === 'template' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select LHDNM e-Invoice Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Standard Invoice', 'Credit Note', 'Debit Note', 'Simplified Invoice'].map((template) => (
                <div
                  key={template}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                  onClick={() => setActiveStep('content')}
                >
                  <h4 className="font-medium mb-2">{template}</h4>
                  <p className="text-sm text-gray-600">LHDNM compliant template</p>
                  <div className="mt-3 text-xs text-green-600">✓ Digital signature ready</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 'content' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Document Content & Required Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Supplier Information</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Company Name" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <input type="text" placeholder="Registration Number" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <input type="text" placeholder="Tax Identification Number" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Customer Name" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <input type="text" placeholder="Address" className="w-full border border-gray-300 rounded px-3 py-2" />
                  <input type="text" placeholder="Customer ID" className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveStep('signature')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Continue to Signature
              </button>
            </div>
          </div>
        )}

        {activeStep === 'signature' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Digital Signature & Authentication</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Signature Pad</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">✍️</div>
                    <p className="text-gray-500">Click to add digital signature</p>
                    <p className="text-xs text-gray-400 mt-1">LHDNM compliant digital signature</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Authentication Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="radio" name="auth" className="mr-2" defaultChecked />
                    <span>Computer Generated (System)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="auth" className="mr-2" />
                    <span>Manual Signature Pad</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="auth" className="mr-2" />
                    <span>Digital Certificate</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveStep('preview')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Preview Invoice
              </button>
            </div>
          </div>
        )}

        {activeStep === 'preview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview & Save to Database</h3>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold">LHDNM e-Invoice</h4>
                <p className="text-gray-600">Invoice #INV-2025-001</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Supplier:</strong> Demo Company Sdn Bhd<br />
                  <strong>Reg No:</strong> 201901234567<br />
                  <strong>TIN:</strong> C12345678901
                </div>
                <div>
                  <strong>Customer:</strong> ABC Sdn Bhd<br />
                  <strong>Address:</strong> Kuala Lumpur<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">✓ LHDNM Compliant ✓ Digital Signature Ready</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Database Storage Information</h4>
              <div className="text-sm text-blue-700">
                <p>• Document will be saved to {scopeLabel} context: {scopeId}</p>
                <p>• Template configuration saved to DocumentTemplate table</p>
                <p>• Invoice data stored with proper LHDNM fields</p>
                <p>• Digital signature metadata included</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep('template')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
              >
                Start Over
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                Save to Database
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context-Aware Document Management */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Existing Documents in {scopeLabel} Context</h2>
        <Dashboard scope={scope} />
      </div>
    </div>
  )
}
