'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingOverview as BillingOverviewType } from './types'
import { DetailedUsageTable } from '../billing-sdk/detailed-usage-table'

interface BillingOverviewProps {
    overview: BillingOverviewType
    className?: string
    version?: 'new' | 'existing'
}

export function BillingOverview({ overview, className, version = 'new' }: BillingOverviewProps) {
    const totalUsage = overview.usage.reduce((acc, metric) =>
        typeof metric.limit === 'number' ? acc + metric.current : acc, 0
    )
    const totalLimit = overview.usage.reduce((acc, metric) =>
        typeof metric.limit === 'number' ? acc + metric.limit : acc, 0
    )
    const usagePercent = totalLimit > 0 ? Math.round((totalUsage / totalLimit) * 100) : 0

    return (
        <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
            <div className={cn('w-full space-y-6', className)}>
                {/* Plan & Status */}
                <Card className="p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">{overview.currentPlan.title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{overview.currentPlan.description}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                            {overview.subscription.state}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
                        <div className="group from-muted to-background/10 border-border/30 hover:border-border/60 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3 md:bg-gradient-to-tl">
                            <span className="text-muted-foreground mb-1 block text-xs sm:text-sm">
                                Current Plan
                            </span>
                            <div className="group-hover:text-primary text-sm font-medium transition-colors duration-200 sm:text-base">
                                {overview.currentPlan.price}
                                <span className="text-sm font-normal text-muted-foreground">
                                    /{overview.currentPlan.duration}
                                </span>
                            </div>
                        </div>
                        <div className="group from-muted to-background/10 border-border/30 hover:border-border/60 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3 md:bg-gradient-to-tl">
                            <div className="flex items-start justify-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground mb-1 block text-xs sm:text-sm">
                                    Next Billing Date
                                </span>
                            </div>
                            <div className="group-hover:text-primary text-sm font-medium transition-colors duration-200 sm:text-base">
                                {overview.upcomingInvoice ? new Date(overview.upcomingInvoice.dueDate).toLocaleDateString() : '-'}
                            </div>
                        </div>
                        <div className="group from-muted to-background/10 border-border/30 hover:border-border/60 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3 md:bg-gradient-to-tl">
                            <div className="flex items-start justify-start gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground mb-1 block text-xs sm:text-sm">
                                    Payment Method
                                </span>
                            </div>
                            <div className="group-hover:text-primary text-sm font-medium transition-colors duration-200 sm:text-base">
                                {overview.paymentMethod?.cardNumber ? (
                                    <>**** **** **** {overview.paymentMethod.cardNumber.slice(-4)}</>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Usage This Month */}
                {version === 'existing' && overview.usage.length > 0 && (
                    <Card className="p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Usage This Month</h3>
                            <Badge variant="outline">
                                {totalUsage.toLocaleString()} / {totalLimit.toLocaleString()}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {overview.usage.map((metric) => (
                                <div key={metric.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{metric.name}</span>
                                        <span className="text-muted-foreground">
                                            {metric.current} / {typeof metric.limit === 'number' ? metric.limit : '∞'} {metric.unit}
                                        </span>
                                    </div>
                                    {typeof metric.limit === 'number' && (
                                        <Progress value={(metric.current / metric.limit) * 100} className="h-1.5" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {usagePercent > 80 && totalLimit > 0 && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-700">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>You're approaching your usage limit. Consider upgrading your plan.</p>
                            </div>
                        )}
                    </Card>
                )
                }

                {version === 'new' && overview.usage.length > 0 && (
                    <DetailedUsageTable 
                        title={'Usage This Month'}
                        description={'Detailed breakdown of your usage metrics for the current month.'} 
                        resources={[
                            ...overview.usage.map((metric) => ({
                                name: metric.name,
                                current: metric.current || 0,
                                used: metric.current || 0,
                                limit: typeof metric.limit === 'number' ? metric.limit : Infinity,
                                unit: metric.unit,
                            }))
                        ]}                      
                        
                    />
                            
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 shadow-lg transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-muted-foreground">Recent Invoices</div>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">
                            {overview.recentInvoices.length}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Last 30 days
                        </p>
                    </Card>

                    <Card className="p-6 shadow-lg transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-muted-foreground">Credits Balance</div>
                            <Badge variant="outline" className="backdrop-blur-sm">{overview.credits.remaining.toLocaleString()}</Badge>
                        </div>
                        <div className="text-2xl font-bold">
                            {overview.credits.remaining.toLocaleString()}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {overview.credits.used} used of {overview.credits.total}
                        </p>
                    </Card>

                    <Card className="p-6 shadow-lg transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-muted-foreground">Upcoming Invoice</div>
                        </div>
                        <div className="text-2xl font-bold">
                            {overview.upcomingInvoice ? (
                                <>
                                    {overview.upcomingInvoice.currency} {overview.upcomingInvoice.amount.toFixed(2)}
                                </>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                        </div>
                        {overview.upcomingInvoice && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                Due {new Date(overview.upcomingInvoice.dueDate).toLocaleString()}
                            </p>
                        )}
                    </Card>
                </div>
            </div >
        </div >
    )
}
