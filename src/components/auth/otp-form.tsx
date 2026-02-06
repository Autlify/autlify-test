'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { RefreshCwIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface OTPFormProps {
    email: string
    onVerified: () => void
    onError?: (error: string) => void
}

export function OTPForm({ email, onVerified, onError }: OTPFormProps) {
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)

    const handleResend = async () => {
        setIsLoading(true)
        setError('')

        try {
            // Call register/verify to resend OTP
            const res = await fetch('/api/auth/register/verify', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to resend code')
            }

            const data = await res.json()
            setResendCooldown(data.cooldownSeconds || 60)

            // Start cooldown timer
            let countdown = data.cooldownSeconds || 60
            const timer = setInterval(() => {
                countdown--
                setResendCooldown(countdown)
                if (countdown <= 0) clearInterval(timer)
            }, 1000)
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to resend code'
            setError(errorMsg)
            onError?.(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter all 6 digits')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Call register/confirm to verify OTP token
            const res = await fetch('/api/auth/register/confirm', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Invalid verification code')
            }

            onVerified()
        } catch (err: any) {
            const errorMsg = err.message || 'Verification failed'
            setError(errorMsg)
            onError?.(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className='mx-auto max-w-md'>
            <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                    Enter the verification code we sent to:{' '}
                    <span className='font-medium'>{email}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium'>Verification code</label>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleResend}
                        disabled={isLoading || resendCooldown > 0}
                    >
                        <RefreshCwIcon className='h-4 w-4' />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </Button>
                </div>

                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isLoading}>
                    <InputOTPGroup className='*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl'>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator className='mx-2' />
                    <InputOTPGroup className='*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl'>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>

                <p className='text-sm text-muted-foreground'>
                    No code received?{' '}
                    <a href='#' className='underline hover:text-foreground'>
                        Check spam folder
                    </a>
                </p>
            </CardContent>
            <CardFooter className='flex flex-col gap-3'>
                <Button
                    onClick={handleVerify}
                    disabled={isLoading || otp.length !== 6}
                    className='w-full'
                >
                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Verify Code
                </Button>
                <p className='text-center text-sm text-muted-foreground'>
                    Having trouble?{' '}
                    <a href='#' className='underline hover:text-foreground'>
                        Contact support
                    </a>
                </p>
            </CardFooter>
        </Card>
    )
}
