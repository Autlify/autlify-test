import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { getGLContext } from '@/lib/features/fi/general-ledger/core/context'
import { listPostingRules } from '@/lib/features/fi/general-ledger/actions/posting-rules'
import { listChartOfAccounts } from '@/lib/features/fi/general-ledger/actions/chart-of-accounts'
import { PostingRulesTable } from '@/components/fi/general-ledger/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Settings2, Plus, Zap, Scale, Percent, RefreshCw, PiggyBank, ArrowRightLeft, Wrench } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { PostingRuleCategory } from '@/lib/schemas/fi/general-ledger/posting-rules'

type Props = {
  params: Promise<{ agencyId: string }>
  searchParams: Promise<{ category?: string }>
}

const CATEGORY_ICONS: Record<PostingRuleCategory, React.ReactNode> = {
  FOREX: <ArrowRightLeft className="h-4 w-4" />,
  ROUNDING: <Scale className="h-4 w-4" />,
  DISCREPANCY: <RefreshCw className="h-4 w-4" />,
  TAX: <Percent className="h-4 w-4" />,
  CLEARING: <PiggyBank className="h-4 w-4" />,
  ALLOCATION: <Zap className="h-4 w-4" />,
  CUSTOM: <Wrench className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<PostingRuleCategory, string> = {
  FOREX: 'Forex',
  ROUNDING: 'Rounding',
  DISCREPANCY: 'Discrepancy',
  TAX: 'Tax',
  CLEARING: 'Clearing',
  ALLOCATION: 'Allocation',
  CUSTOM: 'Custom',
}

export default async function PostingRulesPage({ params, searchParams }: Props) {
  const { agencyId } = await params
  const { category } = await searchParams

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

  // Permission check based on context
  const permissionKey = KEYS.fi.configuration.posting_rules.view
  const hasPermission = context.contextType === 'SUBACCOUNT' && context.subAccountId
    ? await hasSubAccountPermission(context.subAccountId, permissionKey)
    : await hasAgencyPermission(agencyId, permissionKey)

  if (!hasPermission) {
    notFound()
  }

  // Check edit permission
  const canEdit = context.contextType === 'SUBACCOUNT' && context.subAccountId
    ? await hasSubAccountPermission(context.subAccountId, KEYS.fi.configuration.posting_rules.manage)
    : await hasAgencyPermission(agencyId, KEYS.fi.configuration.posting_rules.manage)

  // Fetch data
  const [rulesResult, accountsResult] = await Promise.all([
    listPostingRules(),
    listChartOfAccounts(),
  ])

  // Handle paginated response structure
  const rulesData = rulesResult.success ? rulesResult.data : null
  const rules: any[] = Array.isArray(rulesData) ? rulesData : (rulesData?.rules ?? [])
  const accounts = accountsResult.success ? (accountsResult.data ?? []) : []

  // Filter by category if specified - use 'ALL' or a valid category
  type CategoryFilter = PostingRuleCategory | 'ALL'
  const activeCategory: CategoryFilter = category && category in CATEGORY_LABELS 
    ? (category as PostingRuleCategory) 
    : 'ALL'
  const filteredRules = activeCategory === 'ALL' 
    ? rules 
    : rules.filter((r: any) => {
        // Category may be stored in conditions JSON
        const ruleCategory = r.category ?? r.conditions?.category
        return ruleCategory === activeCategory
      })

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <div>
            <h1 className="text-2xl font-bold">Posting Rules</h1>
            <p className="text-sm text-muted-foreground">
              Configure automated posting rules for forex, discrepancies, tax, and more
            </p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/agency/${agencyId}/fi/general-ledger/settings/posting-rules/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue={activeCategory} className="w-full">
        <TabsList>
          <TabsTrigger value="ALL" asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/settings/posting-rules`}>
              All
            </Link>
          </TabsTrigger>
          {(Object.keys(CATEGORY_LABELS) as PostingRuleCategory[]).map((cat) => (
            <TabsTrigger key={cat} value={cat} asChild>
              <Link 
                href={`/agency/${agencyId}/fi/general-ledger/settings/posting-rules?category=${cat}`}
                className="flex items-center gap-1"
              >
                {CATEGORY_ICONS[cat]}
                {CATEGORY_LABELS[cat]}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <Suspense fallback={<RulesTableSkeleton />}>
          <TabsContent value={activeCategory} className="mt-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Rules</CardDescription>
                  <CardTitle className="text-2xl">{rules.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {rules.filter((r: any) => r.isActive).length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Auto-Post</CardDescription>
                  <CardTitle className="text-2xl text-blue-600">
                    {rules.filter((r: any) => r.autoPost).length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In Category</CardDescription>
                  <CardTitle className="text-2xl">{filteredRules.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Rules Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeCategory === 'ALL' ? 'All Posting Rules' : `${CATEGORY_LABELS[activeCategory]} Rules`}
                </CardTitle>
                <CardDescription>
                  {getCategoryDescription(activeCategory)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PostingRulesTable 
                  rules={filteredRules}
                  accounts={accounts}
                  canEdit={canEdit}
                  agencyId={agencyId}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  )
}

function getCategoryDescription(category: PostingRuleCategory | 'ALL'): string {
  const descriptions: Record<PostingRuleCategory | 'ALL', string> = {
    ALL: 'All automated posting rules configured for your organization',
    FOREX: 'Exchange rate differences and currency revaluation rules',
    ROUNDING: 'Cent/decimal rounding adjustment rules',
    DISCREPANCY: 'Small payment difference write-off rules',
    TAX: 'Tax posting and clearing rules',
    CLEARING: 'Cash and account clearing rules',
    ALLOCATION: 'Cost allocation and distribution rules',
    CUSTOM: 'Custom user-defined posting rules',
  }
  return descriptions[category]
}

function RulesTableSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
