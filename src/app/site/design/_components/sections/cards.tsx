'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CardsSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-fg-primary">Cards & Badges</h2>
        <p className="text-fg-secondary">
          Card containers using <code className="px-1 py-0.5 bg-muted rounded text-sm">bg-card</code> and <code className="px-1 py-0.5 bg-muted rounded text-sm">border-border</code> tokens.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>
              This card uses design system tokens for background and borders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-fg-secondary">
              The card content area inherits colors from the design system. No custom colors applied.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Continue</Button>
          </CardFooter>
        </Card>

        {/* Card with Badges */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Badge Variations</CardTitle>
                <CardDescription>Different badge styles</CardDescription>
              </div>
              <Badge>New</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-fg-primary">Muted Background</CardTitle>
            <CardDescription>
              Using <code className="px-1 py-0.5 bg-card rounded text-xs">bg-muted</code> variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-secondary">
              This card demonstrates the muted background variant for subtle emphasis.
            </p>
          </CardContent>
        </Card>

        {/* Stat Card */}
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold text-fg-primary">$45,231.89</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-fg-tertiary">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
