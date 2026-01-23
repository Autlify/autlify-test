'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Fingerprint } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/types'

interface PasskeyButtonProps {
    email: string
    variant?: 'signin' | 'signup'
    onSuccess?: (result: any) => void
    onError?: (error: string) => void
    disabled?: boolean
}

export function PasskeyButton({
    email,
    variant = 'signup',
    onSuccess,
    onError,
    disabled = false
}: PasskeyButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handlePasskeySignup = async () => {
        try {
            // Get registration options from server
            const optionsRes = await fetch('/api/auth/passkey/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (!optionsRes.ok) {
                const error = await optionsRes.json()
                throw new Error(error.message || 'Failed to get registration options')
            }

            const options: PublicKeyCredentialCreationOptionsJSON = await optionsRes.json()

            // Start WebAuthn registration
            const credential = await startRegistration(options)

            // Verify registration with server
            const verifyRes = await fetch('/api/auth/passkey/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, credential }),
            })

            if (!verifyRes.ok) {
                const error = await verifyRes.json()
                throw new Error(error.message || 'Failed to verify registration')
            }

            const { success } = await verifyRes.json()

            if (success) {
                onSuccess?.({ ok: true })
                router.push('/agency')
            }
        } catch (err: any) {
            let errorMsg = err.message || 'Passkey registration failed'
            if (err.name === 'NotAllowedError') {
                errorMsg = 'Passkey registration was cancelled or not allowed'
            }
            throw new Error(errorMsg)
        }
    }

    const handlePasskeySignin = async () => {
        try {
            // Get authentication options from server
            const optionsRes = await fetch('/api/auth/passke/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            if (!optionsRes.ok) {
                const error = await optionsRes.json()
                throw new Error(error.message || 'Failed to get authentication options')
            }

            const options: PublicKeyCredentialRequestOptionsJSON = await optionsRes.json()

            // Start WebAuthn authentication
            const credential = await startAuthentication(options)

            // Verify authentication with server
            const verifyRes = await fetch('/api/auth/passkey/signin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
            })

            if (!verifyRes.ok) {
                const error = await verifyRes.json()
                throw new Error(error.message || 'Failed to verify authentication')
            }

            const { success } = await verifyRes.json()

            if (success) {
                onSuccess?.({ ok: true })
                router.push('/agency')
            }
        } catch (err: any) {
            let errorMsg = err.message || 'Passkey signin failed'
            if (err.name === 'NotAllowedError') {
                errorMsg = 'Passkey signin was cancelled or not allowed'
            }
            throw new Error(errorMsg)
        }
    }

    const handlePasskey = async () => {
        if (!email) {
            setError('Please enter your email first')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            if (variant === 'signup') {
                await handlePasskeySignup()
            } else {
                await handlePasskeySignin()
            }
        } catch (err: any) {
            const errorMsg = err.message || `An error occurred with ${variant === 'signup' ? 'passkey registration' : 'passkey signin'}`
            setError(errorMsg)
            onError?.(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasskey}
                disabled={isLoading || disabled || !email}
            >
                <Fingerprint className="mr-2 h-4 w-4" />
                {variant === 'signup' ? 'Sign up with Passkey' : 'Sign in with Passkey'}
            </Button>
            {error && (
                <Alert className="border-destructive/30 bg-destructive/10">
                    <AlertDescription className="text-destructive-foreground">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}