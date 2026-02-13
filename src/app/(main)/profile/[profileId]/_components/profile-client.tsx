"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Mail,
    Shield,
    Calendar,
    Building2,
    Activity,
    Settings,
    Key,
    Monitor,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Pencil,
    LogOut,
    Smartphone,
    Globe,
    Lock,
    Bell,
    Sparkles,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { ProfileData } from "../page"
import { ButtonGroup } from '@/components/ui-2/button-group'
import { BasicProfile, basicProfileSchema } from '@/types/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut } from 'next-auth/react'

interface ProfileClientProps {
    data: ProfileData
}

// Stat Card Component
const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    color = "blue",
}: {
    icon: React.ElementType
    label: string
    value: string | number
    trend?: string
    color?: "blue" | "green" | "purple" | "amber"
}) => {
    const iconColors = {
        blue: "text-blue-600 dark:text-blue-400",
        green: "text-emerald-600 dark:text-emerald-400",
        purple: "text-purple-600 dark:text-purple-400",
        amber: "text-amber-600 dark:text-amber-400",
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm hover:border-border/80"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
                    {trend && (
                        <p className="text-xs leading-relaxed text-muted-foreground">{trend}</p>
                    )}
                </div>
                <div className={cn("rounded-lg bg-muted/50 p-2.5 shrink-0", iconColors[color])}>
                    <Icon className="h-4.5 w-4.5" />
                </div>
            </div>
        </motion.div>
    )
}

// Premium Profile Header
const ProfileHeader = ({ user, className }: { user: ProfileData["user"]; stats: ProfileData["stats"]; className?: string }) => {
    const [isEditing, setIsEditing] = useState(false)
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const form = useForm<BasicProfile>({
        resolver: zodResolver(basicProfileSchema),
        mode: 'onChange',
        defaultValues: {
            name: user.name,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            avatarUrl: user.avatarUrl || '',
        }
    })

    const isLoading = form.formState.isSubmitting

    const onSubmit = async (data: BasicProfile) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))
            console.log("Saved data:", data)
            setIsEditing(false)
            form.reset(data)
        } catch (error) {
            console.error("Error saving:", error)
        }
    }

    const handleCancel = () => {
        form.reset()
        setIsEditing(false)
    }



    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl border border-border/50 bg-card ${className}`}
        >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

            <div className="relative px-6 py-8 md:px-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    {/* Left Section - Avatar & Info */}
                    <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-semibold text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg">
                                <Pencil className="h-3 w-3" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 space-y-3 text-center md:text-left min-w-0">
                            <div className="space-y-2.5">
                                <div className="flex flex-col items-center gap-2.5 md:flex-row md:items-center">
                                    <div className="min-w-0 w-full md:flex-1">
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isEditing ? 'edit' : 'view'}
                                                    // smooth animation from original fields moving slightly right to make spaces for  input field
                                                    initial={{ opacity: 0, x: isEditing ? 0 : -20, scale: 0.95 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: isEditing ? 0 : 20, scale: 0.95 }}
                                                    transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                                                    className="min-h-[32px]"
                                                >
                                                    {isEditing ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
                                                            <Input
                                                                {...form.register('firstName')}
                                                                placeholder="First Name"
                                                                disabled={isLoading}
                                                                className="h-8 transition-all duration-200"
                                                            />
                                                            <Input
                                                                {...form.register('lastName')}
                                                                placeholder="Last Name"
                                                                disabled={isLoading}
                                                                className="h-8 transition-all duration-200"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <h1 className="text-xl font-semibold tracking-tight leading-tight h-8 flex items-center">
                                                            {user.name}
                                                        </h1>
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                        </form>
                                    </div>
                                    <div className="flex items-center gap-2 min-h-[32px]">
                                        {isEditing && (
                                            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                                                <AlertCircle className="mr-1.5 h-3 w-3" />
                                                Editing
                                            </Badge>
                                        )}
                                        {isLoading && (
                                            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                                                <Sparkles className="mr-1.5 h-3 w-3 animate-pulse" />
                                                Saving...
                                            </Badge>
                                        )}
                                        {!isEditing && user.emailVerified && (
                                            <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                                                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground leading-relaxed">
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 md:justify-start">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                        <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <ButtonGroup orientation="horizontal" className="min-w-0">
                            <Button
                                onClick={() => {
                                    if (!isEditing) {
                                        setIsEditing(true)
                                    } else {
                                        form.handleSubmit(onSubmit)()
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                className="justify-center rounded-md min-w-[110px]">
                                <Settings className="mr-2 h-4 w-4" />
                                {isLoading ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
                            </Button>
                            <Button
                                onClick={() => {
                                    if (isEditing) {
                                        handleCancel()
                                    } else {
                                        signOut()
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                className="rounded-md justify-center text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground min-w-[110px]">
                                {isEditing ? (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </>
                                )}
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// Overview Tab Content
const OverviewTab = ({ data }: { data: ProfileData }) => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Building2}
                    label="Organizations"
                    value={data.stats.totalAgencies}
                    trend="+2 this month"
                    color="blue"
                />
                <StatCard
                    icon={Monitor}
                    label="Active Sessions"
                    value={data.stats.totalSessions}
                    color="green"
                />
                <StatCard
                    icon={Calendar}
                    label="Account Age"
                    value={`${data.stats.accountAge}d`}
                    color="purple"
                />
                <StatCard
                    icon={Shield}
                    label="Security Score"
                    value={data.stats.mfaEnabled ? "98%" : "65%"}
                    trend={data.stats.mfaEnabled ? "Excellent" : "Needs attention"}
                    color={data.stats.mfaEnabled ? "green" : "amber"}
                />
            </div>

            {/* Organizations Section */}
            <Card className="border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold tracking-tight">Organizations</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Workspaces and teams you&apos;re part of</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="space-y-2">
                        {data.memberships.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-6 text-center">
                                <div className="rounded-full bg-muted/50 p-3 mb-4">
                                    <Building2 className="h-6 w-6 text-muted-foreground/70" />
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    No organizations yet
                                </p>
                                <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                                    You haven&apos;t joined any organizations yet
                                </p>
                                <Button variant="outline" size="sm">
                                    Create Organization
                                </Button>
                            </div>
                        ) : (
                            data.memberships.map((membership, index) => (
                                <motion.div
                                    key={membership.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group flex items-center justify-between rounded-lg border border-border bg-card p-2.5 transition-all hover:bg-accent/50 hover:border-border/80"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={membership.agency.agencyLogo || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white">
                                                {membership.agency.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-medium text-sm leading-tight truncate">{membership.agency.name}</p>
                                                {membership.isPrimary && (
                                                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 shrink-0">
                                                        Owner
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground capitalize leading-relaxed">{membership.role.toLowerCase()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:text-muted-foreground group-hover:translate-x-0.5 shrink-0 ml-2" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold tracking-tight">Recent Activity</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Your latest actions and events</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="relative space-y-4">
                        <div className="absolute left-2 top-3 bottom-3 w-px bg-border" />
                        {[
                            { action: "Logged in from Chrome on macOS", time: "2 minutes ago", icon: Monitor },
                            { action: "Updated profile settings", time: "1 hour ago", icon: Settings },
                            { action: "Joined Acme Corporation", time: "2 days ago", icon: Building2 },
                            { action: "Enabled two-factor authentication", time: "1 week ago", icon: Shield },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-start gap-3.5 pl-9"
                            >
                                <div className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-card">
                                    <item.icon className="h-2.5 w-2.5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium leading-relaxed mb-0.5">{item.action}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Security Tab Content
const SecurityTab = ({ data }: { data: ProfileData }) => {
    return (
        <div className="space-y-6">
            {/* Security Overview Card */}
            <Card className="border-border">
                <CardHeader className="pb-5">
                    <CardTitle className="text-base font-semibold tracking-tight">Security Status</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Your account protection level</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                    <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
                        <div className="relative shrink-0">
                            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="stroke-muted"
                                    strokeWidth="5"
                                    fill="none"
                                    cx="50"
                                    cy="50"
                                    r="42"
                                />
                                <circle
                                    className="stroke-emerald-600 dark:stroke-emerald-400"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    fill="none"
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    strokeDasharray={`${data.stats.mfaEnabled ? 260 : 165} 264`}
                                    style={{
                                        transition: "stroke-dasharray 0.5s ease-in-out",
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-semibold tabular-nums">{data.stats.mfaEnabled ? "98" : "65"}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2.5 min-w-0">
                            <SecurityItem
                                icon={Mail}
                                title="Email Verified"
                                status={!!data.user.emailVerified}
                            />
                            <SecurityItem
                                icon={Shield}
                                title="Two-Factor Authentication"
                                status={data.stats.mfaEnabled}
                            />
                            <SecurityItem
                                icon={Key}
                                title="Strong Password"
                                status={true}
                            />
                            <SecurityItem
                                icon={Lock}
                                title="Recovery Options"
                                status={false}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold tracking-tight">Two-Factor Authentication</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2">
                    {data.mfaMethods.length === 0 ? (
                        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-dashed border-border p-5 sm:flex-row sm:items-center">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-relaxed">No 2FA methods configured</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Protect your account by adding two-factor authentication
                                </p>
                            </div>
                            <Button size="sm" className="shrink-0">
                                Enable 2FA
                            </Button>
                        </div>
                    ) : (
                        data.mfaMethods.map((method) => (
                            <div
                                key={method.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="rounded-lg bg-muted p-1.5 shrink-0">
                                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium capitalize leading-tight mb-0.5">{method.type.toLowerCase()}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Added {new Date(method.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={method.isEnabled ? "default" : "secondary"} className="text-xs shrink-0 ml-3">
                                    {method.isEnabled ? "Active" : "Disabled"}
                                </Badge>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold tracking-tight">Active Sessions</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Devices currently logged into your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-2">
                    {data.sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5"
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="rounded-lg bg-muted p-1.5 shrink-0">
                                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-medium leading-tight">Session</p>
                                        {index === 0 && (
                                            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Expires {new Date(session.expires).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {index !== 0 && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

const SecurityItem = ({
    icon: Icon,
    title,
    status,
}: {
    icon: React.ElementType
    title: string
    status: boolean
}) => {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm leading-relaxed">{title}</span>
            </div>
            {status ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
        </div>
    )
}

// Settings Tab Content
const SettingsTab = ({ data }: { data: ProfileData }) => {
    return (
        <div className="space-y-6">
            {/* Preferences */}
            <Card className="border-border">
                <CardHeader className="pb-5">
                    <CardTitle className="text-base font-semibold tracking-tight">Preferences</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                    <SettingItem
                        icon={Bell}
                        title="Email Notifications"
                        description="Receive email updates about your account"
                        defaultChecked={true}
                    />
                    <Separator />
                    <SettingItem
                        icon={Sparkles}
                        title="Marketing Emails"
                        description="Receive product updates and special offers"
                        defaultChecked={false}
                    />
                    <Separator />
                    <SettingItem
                        icon={Globe}
                        title="Public Profile"
                        description="Allow others to see your profile"
                        defaultChecked={true}
                    />
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader className="pb-5">
                    <CardTitle className="text-base font-semibold text-destructive tracking-tight">Danger Zone</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-5 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-relaxed">Delete Account</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" className="shrink-0">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const SettingItem = ({
    icon: Icon,
    title,
    description,
    defaultChecked,
}: {
    icon: React.ElementType
    title: string
    description: string
    defaultChecked: boolean
}) => {
    return (
        <div className="flex items-center justify-between gap-6">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="rounded-lg bg-muted p-2 mt-0.5 shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed mb-0.5">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
            </div>
            <Switch defaultChecked={defaultChecked} className="shrink-0" />
        </div>
    )
}

// Main Profile Client Component
const ProfileClient = ({ data }: ProfileClientProps) => {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:px-6 lg:px-8">
            {/* Profile Header */}

            <ProfileHeader user={data.user} stats={data.stats} />

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted p-1 h-11">
                    <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-background">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Settings</span>
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                        className="mt-6"
                    >
                        <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <OverviewTab data={data} />
                        </TabsContent>
                        <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <SecurityTab data={data} />
                        </TabsContent>
                        <TabsContent value="settings" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <SettingsTab data={data} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

ProfileClient.displayName = "ProfileClient"

export { ProfileClient }