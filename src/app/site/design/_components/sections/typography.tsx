'use client'

import React from 'react'

export function TypographySection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-fg-primary">Typography</h2>
        <p className="text-fg-secondary">
          Text hierarchy using semantic foreground tokens.
        </p>
      </div>

      <div className="space-y-8 p-6 rounded-lg border border-border bg-card">
        {/* Headings */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Headings</p>
          </div>
          <h1 className="text-4xl font-bold text-fg-primary">Heading 1 - Primary</h1>
          <h2 className="text-3xl font-bold text-fg-primary">Heading 2 - Primary</h2>
          <h3 className="text-2xl font-semibold text-fg-primary">Heading 3 - Primary</h3>
          <h4 className="text-xl font-semibold text-fg-secondary">Heading 4 - Secondary</h4>
          <h5 className="text-lg font-medium text-fg-secondary">Heading 5 - Secondary</h5>
          <h6 className="text-base font-medium text-fg-tertiary">Heading 6 - Tertiary</h6>
        </div>

        {/* Body Text */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Body Text</p>
          <p className="text-lg text-fg-primary">
            Large body text using <code className="px-1 py-0.5 bg-muted rounded text-sm">text-fg-primary</code> for high readability.
          </p>
          <p className="text-base text-fg-secondary">
            Regular body text using <code className="px-1 py-0.5 bg-muted rounded text-sm">text-fg-secondary</code> for standard content.
          </p>
          <p className="text-sm text-fg-tertiary">
            Small text using <code className="px-1 py-0.5 bg-muted rounded text-xs">text-fg-tertiary</code> for captions and helper text.
          </p>
          <p className="text-xs text-muted-foreground">
            Extra small text using <code className="px-1 py-0.5 bg-muted rounded text-xs">text-muted-foreground</code> for minimal emphasis.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Links</p>
          <div className="space-y-2">
            <p className="text-base text-fg-primary">
              This is a paragraph with a <a href="#" className="text-primary underline-offset-4 hover:underline">primary link</a> inside.
            </p>
            <p className="text-base text-fg-secondary">
              This is a paragraph with an <a href="#" className="text-accent-foreground underline-offset-4 hover:underline">accent link</a> inside.
            </p>
          </div>
        </div>

        {/* Code */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Code</p>
          <p className="text-base text-fg-primary">
            Inline code: <code className="px-2 py-1 bg-muted text-fg-primary rounded font-mono text-sm">const value = true</code>
          </p>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-fg-primary">
{`function example() {
  return "Code block using bg-muted"
}`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  )
}
