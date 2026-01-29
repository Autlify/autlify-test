'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { getAvailableTemplates, applyTemplate } from '@/lib/features/fi/general-ledger/actions/coa-template'
import { initializeGLConfiguration } from '@/lib/features/fi/general-ledger/actions/configuration'
import { createFinancialPeriod } from '@/lib/features/fi/general-ledger/actions/periods'

type Props = {
  agencyId: string
}

type WizardStep = 'company' | 'coa' | 'periods' | 'review'

const steps: { id: WizardStep; title: string; description: string }[] = [
  { id: 'company', title: 'Company Info', description: 'Configure basic settings' },
  { id: 'coa', title: 'Chart of Accounts', description: 'Select a template' },
  { id: 'periods', title: 'Financial Periods', description: 'Set up periods' },
  { id: 'review', title: 'Review & Finish', description: 'Confirm your settings' },
]

const GLSetupWizard = ({ agencyId }: Props) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('company')
  const [isPending, startTransition] = useTransition()
  const [wizardData, setWizardData] = useState<{
    baseCurrency: string
    fiscalYearStart: string
    fiscalYearEnd: string
    requireApproval: boolean
    coaTemplate: string
    startYear: number
    numberOfYears: number
  }>({
    baseCurrency: 'USD',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '12-31',
    requireApproval: true,
    coaTemplate: 'standard',
    startYear: new Date().getFullYear(),
    numberOfYears: 2,
  })

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const goNext = () => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1)
    setCurrentStep(steps[nextIndex].id)
  }

  const goPrev = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0)
    setCurrentStep(steps[prevIndex].id)
  }

  const handleComplete = () => {
    startTransition(async () => {
      try {
        // 1. Initialize GL Configuration
        const configResult = await initializeGLConfiguration({
          baseCurrency: wizardData.baseCurrency,
          fiscalYearStart: wizardData.fiscalYearStart,
          fiscalYearEnd: wizardData.fiscalYearEnd,
          requireApproval: wizardData.requireApproval,
          useControlAccounts: true,
          autoPostingEnabled: false,
          allowFuturePeriodPost: false,
          allowClosedPeriodPost: false,

          // TODO: Missing Step fields in  WizardData
          consolidationEnabled: false,
          consolidationMethod: 'FULL',
          eliminateIntercompany: false,
          autoCreatePeriods: false,
          periodLockDays: 0,
          accountCodeFormat: '',
          accountCodeLength: 0,
          accountCodeSeparator: '',
          erpIntegrationEnabled: false,
          retainAuditDays: 0
        })

        if (!configResult.success) {
          toast.error(configResult.error)
          return
        }

        // 2. Apply COA Template
        const templateResult = await applyTemplate(wizardData.coaTemplate, {
          includeSystemAccounts: true,
        })

        if (!templateResult.success) {
          toast.error(templateResult.error)
          return
        }

        // 3. Create Financial Periods
        for (let year = wizardData.startYear; year < wizardData.startYear + wizardData.numberOfYears; year++) {
          for (let month = 1; month <= 12; month++) {
            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 0)
            const periodsResult = await createFinancialPeriod({
              name: `${year}-${String(month).padStart(2, '0')}`,
              periodType: 'MONTH',
              fiscalYear: year,
              fiscalPeriod: month,
              startDate,
              endDate,
              isYearEnd: month === 12,
            })
            if (!periodsResult.success) {
              toast.error(periodsResult.error)
              return
            }
          }
        }

        toast.success('GL setup completed successfully!')
        router.push(`/agency/${agencyId}/fi/general-ledger`)
        router.refresh()
      } catch (error) {
        toast.error('Failed to complete GL setup')
      }
    })
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>GL Setup Wizard</CardTitle>
        <CardDescription>
          Complete these steps to set up your General Ledger
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          {steps.map((step, idx) => (
            <span
              key={step.id}
              className={idx <= currentStepIndex ? 'text-primary font-medium' : ''}
            >
              {step.title}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {currentStep === 'company' && (
          <CompanyStep
            data={wizardData}
            onUpdate={(data) => setWizardData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {currentStep === 'coa' && (
          <COAStep
            data={wizardData}
            onUpdate={(data) => setWizardData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {currentStep === 'periods' && (
          <PeriodsStep
            data={wizardData}
            onUpdate={(data) => setWizardData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {currentStep === 'review' && <ReviewStep data={wizardData} />}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStepIndex === 0 || isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleComplete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Setup
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={isPending}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
GLSetupWizard.displayName = 'GLSetupWizard'
export { GLSetupWizard }

// ========== Step Components ==========

function CompanyStep({
  data,
  onUpdate,
}: {
  data: any
  onUpdate: (data: any) => void
}) {
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'SGD', name: 'Singapore Dollar' },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Base Currency</label>
        <Select
          value={data.baseCurrency}
          onValueChange={(v) => onUpdate({ baseCurrency: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.code} - {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          This will be your primary reporting currency
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fiscal Year Start</label>
          <Input
            value={data.fiscalYearStart}
            onChange={(e) => onUpdate({ fiscalYearStart: e.target.value })}
            placeholder="01-01"
          />
          <p className="text-sm text-muted-foreground">Format: MM-DD</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fiscal Year End</label>
          <Input
            value={data.fiscalYearEnd}
            onChange={(e) => onUpdate({ fiscalYearEnd: e.target.value })}
            placeholder="12-31"
          />
          <p className="text-sm text-muted-foreground">Format: MM-DD</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Require Approval</label>
          <p className="text-sm text-muted-foreground">
            Journal entries require approval before posting
          </p>
        </div>
        <Switch
          checked={data.requireApproval}
          onCheckedChange={(v) => onUpdate({ requireApproval: v })}
        />
      </div>
    </div>
  )
}

function COAStep({
  data,
  onUpdate,
}: {
  data: any
  onUpdate: (data: any) => void
}) {
  const templates = [
    {
      id: 'standard',
      name: 'Standard Business',
      description: 'General-purpose chart of accounts',
      accounts: 45,
    },
    {
      id: 'service-business',
      name: 'Service Business',
      description: 'For professional service companies',
      accounts: 38,
    },
    {
      id: 'agency',
      name: 'Agency/Creative',
      description: 'For marketing and creative agencies',
      accounts: 52,
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Basic accounts for simple needs',
      accounts: 20,
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select a chart of accounts template to get started quickly
      </p>

      <RadioGroup
        value={data.coaTemplate}
        onValueChange={(v) => onUpdate({ coaTemplate: v })}
        className="grid gap-4"
      >
        {templates.map((t) => (
          <div key={t.id} className="flex items-center space-x-2">
            <RadioGroupItem value={t.id} id={t.id} />
            <label
              htmlFor={t.id}
              className="flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
            >
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
              <span className="text-sm text-muted-foreground">{t.accounts} accounts</span>
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

function PeriodsStep({
  data,
  onUpdate,
}: {
  data: any
  onUpdate: (data: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Starting Year</label>
        <Input
          type="number"
          value={data.startYear}
          onChange={(e) => onUpdate({ startYear: parseInt(e.target.value) })}
          min={2020}
          max={2030}
        />
        <p className="text-sm text-muted-foreground">
          The first year to create financial periods for
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Number of Years</label>
        <Select
          value={data.numberOfYears.toString()}
          onValueChange={(v) => onUpdate({ numberOfYears: parseInt(v) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Year (12 periods)</SelectItem>
            <SelectItem value="2">2 Years (24 periods)</SelectItem>
            <SelectItem value="3">3 Years (36 periods)</SelectItem>
            <SelectItem value="5">5 Years (60 periods)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Monthly periods will be created for each year
        </p>
      </div>
    </div>
  )
}

function ReviewStep({ data }: { data: any }) {
  const templateNames: Record<string, string> = {
    standard: 'Standard Business',
    'service-business': 'Service Business',
    agency: 'Agency/Creative',
    minimal: 'Minimal',
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Please review your settings before completing the setup:
      </p>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base Currency</span>
          <span className="font-medium">{data.baseCurrency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fiscal Year</span>
          <span className="font-medium">
            {data.fiscalYearStart} to {data.fiscalYearEnd}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Require Approval</span>
          <span className="font-medium">{data.requireApproval ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">COA Template</span>
          <span className="font-medium">{templateNames[data.coaTemplate]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Periods</span>
          <span className="font-medium">
            {data.startYear} - {data.startYear + data.numberOfYears - 1} ({data.numberOfYears * 12}{' '}
            periods)
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm">
          <strong>Note:</strong> After setup, you can add more accounts and periods, but some
          settings like base currency cannot be changed after transactions are posted.
        </p>
      </div>
    </div>
  )
}