import { useState, useEffect } from 'react'
import { User as UserIcon, Mail, IdCard, Camera, AlertTriangle, CheckCircle2, MailWarningIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { User } from '../../../generated/prisma/client'
import { useTheme } from 'next-themes'

interface ProfileFormProps {
    user: User
    onSubmit: (updates: Partial<User>) => void
    onClose: () => void
}

export function ProfileForm({ user, onSubmit, onClose }: ProfileFormProps) {
    const { theme } = useTheme()
    const [githubUser, setGithubUser] = useState<{ login: string; avatarUrl: string; email: string } | null>(null)
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
        bio: '',
        phone: '',
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showVerification, setShowVerification] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const emailChanged = formData.email !== user.email



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (emailChanged) {
            setPendingEmail(formData.email)
            setShowVerification(true)
            return
        }

        setIsLoading(true)

        setTimeout(() => {
            onSubmit({
                name: formData.name,
            })
            toast.success('Profile updated successfully')
            setIsLoading(false)
            onClose()
        }, 800)
    }

    const handleEmailVerified = () => {
        setIsLoading(true)

        setTimeout(() => {
            onSubmit({
                name: formData.name,
                email: pendingEmail,
                emailVerified: new Date(),
            })
            toast.success('Email updated and verified successfully')
            setIsLoading(false)
            setShowVerification(false)
            setPendingEmail('')
            onClose()
        }, 800)
    }

    const handleVerificationCancel = () => {
        setFormData({ ...formData, email: user.email })
        setPendingEmail('')
        toast.info('Email change cancelled')
    }

    const handleCancelPendingEmail = () => {
        onSubmit({
        })
        setFormData({ ...formData, email: user.email })
        toast.info('Pending email verification cancelled')
    }

    const initials = formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const handleAvatarChange = () => {
        toast.info('Avatar upload coming soon')
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                    <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={githubUser?.avatarUrl || formData.avatar || undefined} alt={formData.name} width={96} height={96} />
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={handleAvatarChange}
                            className={cn(
                                'absolute inset-0 rounded-full flex items-center justify-center',
                                'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
                                'cursor-pointer'
                            )}
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    {githubUser && (
                        <div className="text-center">
                            <p className="text-sm font-medium">@{githubUser.login}</p>
                            <p className="text-xs text-muted-foreground">Connected GitHub Account</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your full name"
                            required
                            className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50'
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your.email@company.com"
                            required
                            className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50',
                                emailChanged && 'border-accent'
                            )}
                        />
                        {!user.emailVerified && (
                            <div className={cn(
                                'flex items-center justify-between gap-2 p-3 rounded-lg text-sm',
                                theme === 'light' ? 'bg-accent/10' : 'bg-accent/20'
                            )}>
                                <div className="flex items-center gap-2">
                                    <MailWarningIcon className="h-4 w-4 text-accent" />
                                    <div>
                                        <p className="font-medium text-accent">Email verification pending</p>
                                        <p className="text-xs text-muted-foreground">
                                            Waiting for verification of {user.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelPendingEmail}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                        {emailChanged && (
                            <div className="flex items-center gap-2 text-sm text-accent">
                                <CheckCircle2 className="h-4 w-4" />
                                Email will require verification before updating
                            </div>
                        )}
                        {!emailChanged && user.emailVerified && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Email verified
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="flex items-center gap-2">
                            <IdCard className="h-4 w-4" />
                            Role
                        </Label>
                        <Input
                            id="role"
                            value={''}
                            disabled
                            className={cn(
                                'bg-muted cursor-not-allowed',
                                theme === 'dark' && 'bg-background/30'
                            )}
                        />
                        <p className="text-xs text-muted-foreground">Contact your administrator to change your role</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50'
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50'
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Saving...' : emailChanged ? 'Verify & Save' : 'Save Changes'}
                    </Button>
                </div>
            </form>

        </>
    )
}