'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface TermsAgreementProps {
  agreed: boolean
  onChange: (agreed: boolean) => void
  variant?: 'signin' | 'signup'
}

export function TermsAgreement({ agreed, onChange, variant = 'signup' }: TermsAgreementProps) {
  const actionText = variant === 'signin' ? 'signing in' : 'signing up'

  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={agreed}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="mt-1"
      />
      <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground cursor-pointer font-normal">
        By {actionText}, you agree to our{' '}
        <Link href="/legal/terms-of-service" target="_blank" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        {', '}
        <Link href="/legal/privacy-policy" target="_blank" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        {', and '}
        <Link href="/legal/data-processing-agreement" target="_blank" className="underline hover:text-foreground">
          Data Processing Agreement
        </Link>
        .
      </Label>
    </div>
  )
}
