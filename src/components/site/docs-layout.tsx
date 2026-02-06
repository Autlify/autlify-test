'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, ChevronRight, ChevronDown, Book, Code, Rocket, FileText, Zap, Shield, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocSection {
  title: string
  icon?: React.ElementType
  items: {
    title: string
    href: string
    badge?: string
  }[]
}

const docSections: DocSection[] = [
  {
    title: "Getting Started",
    icon: Rocket,
    items: [
      { title: "Introduction", href: "/site/docs" },
      { title: "Quick Start", href: "/site/docs/getting-started/quick-start" },
      { title: "Installation", href: "/site/docs/getting-started/installation" },
      { title: "First Project", href: "/site/docs/getting-started/first-project" },
      { title: "Keyboard Shortcuts", href: "/site/docs/getting-started/shortcuts" },
    ]
  },
  {
    title: "Core Concepts",
    icon: Book,
    items: [
      { title: "Projects & Workflows", href: "/site/docs/concepts/projects" },
      { title: "Tasks & Issues", href: "/site/docs/concepts/tasks" },
      { title: "Teams & Permissions", href: "/site/docs/concepts/teams" },
      { title: "Views & Filters", href: "/site/docs/concepts/views" },
      { title: "Custom Fields", href: "/site/docs/concepts/custom-fields" },
    ]
  },
  {
    title: "Guides",
    icon: FileText,
    items: [
      { title: "Project Templates", href: "/site/docs/guides/templates" },
      { title: "Custom Workflows", href: "/site/docs/guides/workflows" },
      { title: "Integrations Setup", href: "/site/docs/guides/integrations" },
      { title: "Team Management", href: "/site/docs/guides/team-management" },
      { title: "Import & Export", href: "/site/docs/guides/import-export" },
    ]
  },
  {
    title: "API Reference",
    icon: Code,
    items: [
      { title: "Authentication", href: "/site/docs/api/authentication" },
      { title: "REST API", href: "/site/docs/api/rest" },
      { title: "GraphQL", href: "/site/docs/api/graphql" },
      { title: "Webhooks", href: "/site/docs/api/webhooks" },
      { title: "Rate Limits", href: "/site/docs/api/rate-limits" },
    ]
  },
  {
    title: "Features",
    icon: Zap,
    items: [
      { title: "Automation", href: "/site/docs/features/automation" },
      { title: "Notifications", href: "/site/docs/features/notifications" },
      { title: "Reporting", href: "/site/docs/features/reporting" },
      { title: "Collaboration", href: "/site/docs/features/collaboration" },
    ]
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { title: "Authentication Methods", href: "/site/docs/security/authentication" },
      { title: "Data Encryption", href: "/site/docs/security/encryption" },
      { title: "Access Control", href: "/site/docs/security/access-control" },
      { title: "Compliance", href: "/site/docs/security/compliance" },
    ]
  },
  {
    title: "Account & Billing",
    icon: Users,
    items: [
      { title: "Account Settings", href: "/site/docs/account/settings" },
      { title: "Billing & Plans", href: "/site/docs/account/billing" },
      { title: "Team Management", href: "/site/docs/account/team" },
    ]
  }
]

interface SidebarSectionProps {
  section: DocSection
  isExpanded: boolean
  onToggle: () => void
}

function SidebarSection({ section, isExpanded, onToggle }: SidebarSectionProps) {
  const pathname = usePathname()
  const Icon = section.icon || Book

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary transition-colors"
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{section.title}</span>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-0.5 border-l border-line-quaternary pl-3">
          {section.items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent-tint text-accent-base font-medium"
                    : "text-fg-tertiary hover:bg-bg-tertiary hover:text-fg-secondary"
                )}
              >
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="rounded-full bg-accent-base/10 px-2 py-0.5 text-xs font-medium text-accent-base">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DocsLayoutProps {
  children: React.ReactNode
  tableOfContents?: {
    title: string
    id: string
    level: number
  }[]
}

export default function DocsLayout({ children, tableOfContents }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Getting Started"]) // Default expanded
  )
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="w-full h-full bg-bg-primary">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-40 border-b border-line-secondary bg-bg-primary/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-4 px-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-secondary bg-bg-secondary text-fg-secondary hover:bg-bg-tertiary lg:hidden"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-tertiary" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-line-secondary bg-bg-secondary pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-tertiary focus:border-accent-tint focus:outline-none focus:ring-1 focus:ring-accent-tint transition-all"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line-tertiary bg-bg-tertiary px-1.5 py-0.5 text-xs text-fg-tertiary sm:inline-block">
              ⌘K
            </kbd>
          </div>

          {/* Right side links */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/site/docs/api"
              className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
            >
              API
            </Link>
            <Link
              href="/site/blog"
              className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              href="https://github.com/autlify/autlify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1800px]">
        {/* Left Sidebar - Navigation */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 top-14 z-30 w-64 overflow-y-auto border-r border-line-secondary bg-bg-primary px-4 py-6 transition-transform lg:sticky lg:block",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <nav>
            {docSections.map((section) => (
              <SidebarSection
                key={section.title}
                section={section}
                isExpanded={expandedSections.has(section.title)}
                onToggle={() => toggleSection(section.title)}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 z-20 bg-bg-primary/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="h-full w-full min-w-0 flex-1 px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Table of Contents */}
        {tableOfContents && tableOfContents.length > 0 && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-l border-line-secondary px-4 py-6 xl:block">
            <div className="text-xs font-semibold uppercase tracking-wider text-fg-tertiary mb-3">
              On this page
            </div>
            <nav className="space-y-1">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn(
                    "block rounded-md px-2 py-1 text-sm text-fg-tertiary hover:text-fg-secondary transition-colors",
                    item.level === 2 && "pl-2",
                    item.level === 3 && "pl-4",
                    item.level === 4 && "pl-6"
                  )}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  )
}
