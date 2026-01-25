'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type Item = { href: string; label: string }

export function BillingNav(props: { baseHref: string }) {
  const pathname = usePathname()
  const base = props.baseHref

  const items: Item[] = [
    { href: `${base}`, label: 'Overview' },
    { href: `${base}/subscription`, label: 'Subscription' },
    { href: `${base}/payment-methods`, label: 'Payment Methods' },
    { href: `${base}/credits`, label: 'Credits & Top‑Up' },
    { href: `${base}/usage`, label: 'Usage' },
    { href: `${base}/invoices`, label: 'Invoices' },
    { href: `${base}/coupons`, label: 'Coupons' },
    { href: `${base}/dunning`, label: 'Dunning' },
    { href: `${base}/allocation`, label: 'Cost Allocation' },
  ]

  return (
    <div className="relative">
      <ScrollArea className="w-full">
        <div className="flex w-max gap-2 pb-2">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== base && pathname?.startsWith(it.href))
            return (
              <Button
                key={it.href}
                asChild
                variant={active ? 'default' : 'outline'}
                className={cn(
                  'h-9 rounded-full px-4 text-sm',
                  active ? 'shadow-sm' : 'bg-card/40'
                )}
              >
                <Link href={it.href}>{it.label}</Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
