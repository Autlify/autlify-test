import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { getGLContext } from '@/lib/features/fi/general-ledger/core/context'
import { getGLConfiguration } from '@/lib/features/fi/general-ledger/actions/configuration'
import { listChartOfAccounts } from '@/lib/features/fi/general-ledger/actions/chart-of-accounts'
import { TaxSettingsForm, TaxCodesTable } from '@/components/fi/general-ledger/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Percent, Plus, Settings, BookOpen, Calculator, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

type Props = {
  params: Promise<{ agencyId: string }>
}

export default async function TaxSettingsPage({ params }: Props) {
  const { agencyId } = await params

  // Auth check
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Get context
  const contextResult = await getGLContext()
  if (!contextResult.success) {
    redirect('/sign-in')
  }

  const { context } = contextResult

  // Permission check
  const permissionKey = KEYS.fi.configuration.tax_settings.view
  const hasPermission = context.contextType === 'SUBACCOUNT' && context.subAccountId
    ? await hasSubAccountPermission(context.subAccountId, permissionKey)
    : await hasAgencyPermission(agencyId, permissionKey)

  if (!hasPermission) {
    notFound()
  }

  // Check edit permission
  const canEdit = context.contextType === 'SUBACCOUNT' && context.subAccountId
    ? await hasSubAccountPermission(context.subAccountId, KEYS.fi.configuration.tax_settings.manage)
    : await hasAgencyPermission(agencyId, KEYS.fi.configuration.tax_settings.manage)

  // Fetch data
  const [configResult, accountsResult] = await Promise.all([
    getGLConfiguration(),
    listChartOfAccounts(),
  ])

  const config = configResult.success ? configResult.data : null
  const taxSettings = config?.taxSettings ?? { enabled: false, taxCodes: [] }
  const accounts = accountsResult.success ? accountsResult.data ?? [] : []

  // Filter accounts for tax purposes (typically liability accounts)
  const taxAccountOptions = accounts.filter((a: any) => 
    ['LIABILITY', 'ASSET', 'EXPENSE'].includes(a.category)
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          <div>
            <h1 className="text-2xl font-bold">Tax Management</h1>
            <p className="text-sm text-muted-foreground">
              Configure tax accounts, codes, and posting behavior
            </p>
          </div>
        </div>
        <Badge variant={taxSettings.enabled ? 'default' : 'secondary'}>
          {taxSettings.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tax Account Management</AlertTitle>
        <AlertDescription>
          Autlify helps you manage tax accounts and postings, but does not calculate tax liability. 
          Please consult with your tax advisor for compliance and filing requirements.
        </AlertDescription>
      </Alert>

      {/* Settings Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tax Codes
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Tax Accounts
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<TaxSettingsSkeleton />}>
          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Configuration</CardTitle>
                  <CardDescription>
                    Enable and configure tax management features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaxSettingsForm
                    section="general"
                    initialData={{
                      enabled: taxSettings.enabled,
                      taxPeriod: taxSettings.taxPeriod ?? 'MONTHLY',
                      autoApplyDefaultTax: taxSettings.autoApplyDefaultTax ?? false,
                      requireTaxOnInvoice: taxSettings.requireTaxOnInvoice ?? false,
                      calculateTaxInclusive: taxSettings.calculateTaxInclusive ?? false,
                    }}
                    disabled={!canEdit}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Setup</CardTitle>
                  <CardDescription>
                    Apply a preset tax template to get started quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start" disabled={!canEdit}>
                      Simple VAT (Input/Output)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!canEdit}>
                      GST (Goods & Services Tax)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!canEdit}>
                      Sales Tax (US Style)
                    </Button>
                    <Button variant="outline" className="justify-start" disabled={!canEdit}>
                      Withholding Tax
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tax Codes Tab */}
          <TabsContent value="codes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tax Codes</CardTitle>
                  <CardDescription>
                    Define tax codes with rates for use in transactions
                  </CardDescription>
                </div>
                {canEdit && (
                  <Link href={`/agency/${agencyId}/fi/general-ledger/settings/tax/codes/new`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tax Code
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <TaxCodesTable 
                  taxCodes={taxSettings.taxCodes ?? []}
                  accounts={accounts}
                  canEdit={canEdit}
                  agencyId={agencyId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Accounts Tab */}
          <TabsContent value="accounts" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>VAT/GST Accounts</CardTitle>
                  <CardDescription>
                    Configure accounts for input and output tax
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaxSettingsForm
                    section="vatAccounts"
                    initialData={{
                      inputVATAccountId: taxSettings.inputVATAccountId ?? null,
                      outputVATAccountId: taxSettings.outputVATAccountId ?? null,
                    }}
                    accounts={taxAccountOptions}
                    disabled={!canEdit}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withholding Tax</CardTitle>
                  <CardDescription>
                    Configure withholding tax account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaxSettingsForm
                    section="withholdingAccounts"
                    initialData={{
                      withholdingTaxAccountId: taxSettings.withholdingTaxAccountId ?? null,
                    }}
                    accounts={taxAccountOptions}
                    disabled={!canEdit}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Settlement</CardTitle>
                  <CardDescription>
                    Configure accounts for tax clearing and payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaxSettingsForm
                    section="clearingAccounts"
                    initialData={{
                      taxClearingAccountId: taxSettings.taxClearingAccountId ?? null,
                      taxPayableAccountId: taxSettings.taxPayableAccountId ?? null,
                      taxReceivableAccountId: taxSettings.taxReceivableAccountId ?? null,
                    }}
                    accounts={taxAccountOptions}
                    disabled={!canEdit}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  )
}

function TaxSettingsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {[1, 2].map((i) => (
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
