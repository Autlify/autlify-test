'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { Tooltip } from '@/components/ui/tooltip'
import { PasskeyButton } from '@/components/auth/passkey-button'

import { TermsAgreement } from '@/components/auth/terms-agreement'
export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/agency'
  const callbackUrl = searchParams?.get('callbackUrl') || redirectPath
  const verified = searchParams?.get('verified')
  const verifiedEmail = searchParams?.get('email')
  const urlError = searchParams?.get('error')

  const [email, setEmail] = useState(verifiedEmail || '')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)

  useEffect(() => {
    if (verified === 'true') {
      setSuccess('Email verified successfully! Please sign in to continue.')
    }
    if (urlError === 'invalid-token') {
      setError('Invalid or expired verification token. Please sign up again.')
    } else if (urlError === 'verification-failed') {
      setError('Email verification failed. Please try again.')
    }
  }, [verified, urlError])


  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Check if it's an email verification error
        if (result.error.includes('verify')) {
          setError('Your email is not verified. Redirecting to verification page...')
          setTimeout(() => {
            router.push(`/agency/verify?email`)
          }, 2000)
        } else {
          setError('Invalid email or password')
        }
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'github' | 'azure-ad') => {
    setIsLoading(true)
    setError('')

    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError(`Failed to sign in with ${provider}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Image src="/assets/autlify-logo.svg" alt="Autlify Logo" width={40} height={40} />
            <span className="ml-2 text-2xl font-bold">Autlify</span>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="border-success/30 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCredentialsSignIn} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email username" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password" 
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <PasskeyButton
              email={email}
              variant="signin"
              onSuccess={(result) => {
                // NextAuth's Passkey provider handles session creation automatically
                router.push(callbackUrl)
                router.refresh()
              }}
              onError={(err) => setError(err)}
              disabled={isLoading}
            />
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have a passkey? Sign in first, then add one from Settings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <Image src="/logos/github.svg" alt="GitHub" width={32} height={32} className="mr-2 brightness-0 invert" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('azure-ad')}
              disabled={isLoading}
            >
              <Image src="/logos/microsoft.svg" alt="Microsoft" width={32} height={32} className="mr-2" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <TermsAgreement
            agreed={termsAgreed}
            onChange={setTermsAgreed}
            variant="signin"
          />
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/agency/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
