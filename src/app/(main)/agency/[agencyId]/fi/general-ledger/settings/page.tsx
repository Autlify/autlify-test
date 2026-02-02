import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { getGLConfiguration, getGLSetupStatus } from '@/lib/features/fi/general-ledger/actions/configuration'
import { GLSettingsForm, GLSetupWizard } from '@/components/fi/general-ledger/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Building, DollarSign, Calendar, Globe, Lock, Database } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  params: Promise<{ agencyId: string }>
}

export default async function GLSettingsPage({ params }: Props) {
  const { agencyId } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general_ledger.settings.view')
  if (!hasPermission) {
    notFound()
  }

  const canEdit = await hasAgencyPermission(agencyId, 'fi.general_ledger.settings.manage')

  // Check setup status
  const setupStatus = await getGLSetupStatus()

  if (!setupStatus.success || !setupStatus.data?.isConfigured) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h1 className="text-2xl font-bold">GL Settings</h1>
        </div>
        <GLSetupWizard agencyId={agencyId} />
      </div>
    )
  }

  const configResult = await getGLConfiguration()
  const config = configResult.data

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h1 className="text-2xl font-bold">GL Settings</h1>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fiscal Year
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="posting" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Posting Rules
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integration
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<SettingsTabSkeleton />}>
          <TabsContent value="general" className="mt-6">
            <GeneralSettingsTab config={config} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="fiscal" className="mt-6">
            <FiscalYearSettingsTab config={config} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="currency" className="mt-6">
            <CurrencySettingsTab config={config} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="posting" className="mt-6">
            <PostingRulesSettingsTab config={config} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="integration" className="mt-6">
            <IntegrationSettingsTab config={config} canEdit={canEdit} />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  )
}

// ========== Tab Components ==========

function GeneralSettingsTab({ config, canEdit }: { config: any; canEdit: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account Code Format</CardTitle>
          <CardDescription>Configure how account codes are structured</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="accountCode"
            initialData={{
              accountCodeFormat: config?.accountCodeFormat ?? '####-####',
              accountCodeLength: config?.accountCodeLength ?? 8,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Accounts</CardTitle>
          <CardDescription>Configure control account behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="controlAccounts"
            initialData={{
              useControlAccounts: config?.useControlAccounts ?? true,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Configure audit log retention</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="audit"
            initialData={{
              retainAuditDays: config?.retainAuditDays ?? 2555,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function FiscalYearSettingsTab({ config, canEdit }: { config: any; canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Year Configuration</CardTitle>
          <CardDescription>Define your organization&apos;s fiscal year</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="fiscalYear"
            initialData={{
              fiscalYearStart: config?.fiscalYearStart ?? '01-01',
              fiscalYearEnd: config?.fiscalYearEnd ?? '12-31',
              autoCreatePeriods: config?.autoCreatePeriods ?? true,
              periodLockDays: config?.periodLockDays ?? 5,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function CurrencySettingsTab({ config, canEdit }: { config: any; canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Base Currency</CardTitle>
          <CardDescription>Configure your base reporting currency</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="currency"
            initialData={{
              baseCurrency: config?.baseCurrency ?? 'USD',
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consolidation Settings</CardTitle>
          <CardDescription>Configure multi-entity consolidation</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="consolidation"
            initialData={{
              consolidationMethod: config?.consolidationMethod ?? 'FULL',
              eliminateIntercompany: config?.eliminateIntercompany ?? true,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function PostingRulesSettingsTab({ config, canEdit }: { config: any; canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Posting Controls</CardTitle>
          <CardDescription>Configure journal entry posting behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="posting"
            initialData={{
              requireApproval: config?.requireApproval ?? true,
              autoPostingEnabled: config?.autoPostingEnabled ?? false,
              allowFuturePeriodPost: config?.allowFuturePeriodPost ?? false,
              allowClosedPeriodPost: config?.allowClosedPeriodPost ?? false,
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationSettingsTab({ config, canEdit }: { config: any; canEdit: boolean }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ERP Integration</CardTitle>
          <CardDescription>Connect to external ERP systems</CardDescription>
        </CardHeader>
        <CardContent>
          <GLSettingsForm
            section="erp"
            initialData={{
              erpIntegrationEnabled: config?.erpIntegrationEnabled ?? false,
              erpSystemType: config?.erpSystemType ?? '',
              erpApiUrl: config?.erpApiUrl ?? '',
            }}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsTabSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}