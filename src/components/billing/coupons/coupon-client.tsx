'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Ticket } from 'lucide-react'

type Coupon = {
  id: string
  percent_off: number | null
  amount_off: number | null
  currency: string | null
  duration: string
  duration_in_months: number | null
}

export function CouponClient() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  const validate = async () => {
    try {
      setLoading(true)
      setCoupon(null)
      const res = await fetch('/api/stripe/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Invalid coupon')
      setCoupon(data.coupon)
      toast.success('Coupon valid')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to validate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Coupons</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Validate a coupon code (Stripe). Apply the code during subscription checkout.
        </p>

        <Separator className="my-4" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code…" />
          <Button onClick={validate} disabled={loading || !code.trim()}>
            {loading ? 'Validating…' : 'Validate'}
          </Button>
        </div>

        {coupon ? (
          <div className="mt-4 rounded-lg border bg-card/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{coupon.id}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {coupon.percent_off != null
                    ? `${coupon.percent_off}% off`
                    : coupon.amount_off != null
                      ? `${coupon.amount_off} ${coupon.currency?.toUpperCase()} off`
                      : '—'}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Duration: {coupon.duration}
                  {coupon.duration_in_months ? ` (${coupon.duration_in_months} months)` : ''}
                </div>
              </div>
              <Badge>Valid</Badge>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
