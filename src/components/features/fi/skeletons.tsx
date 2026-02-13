/**
 * FI Module Loading Skeletons
 * Reusable skeleton components for faster perceived loading
 */

import { Skeleton } from '@/components/ui/skeleton'

export function StatsGridSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={`grid gap-4 md:grid-cols-${columns}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeaderSkeleton />
      <StatsGridSkeleton columns={4} />
      <DashboardStatsSkeleton />
      <TableSkeleton rows={5} />
    </div>
  )
}

export function ListPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <PageHeaderSkeleton />
        <Skeleton className="h-9 w-28" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  )
}

export function AgingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
