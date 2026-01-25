'use client';

import React, { useState } from 'react';
import { PasskeyDeviceDetector } from '@/components/auth/passkey/passkey-device-detector';
import { PasskeyAuthentication } from '@/components/auth/passkey/passkey-authentication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, Mail, Lock } from 'lucide-react';

export function PasskeyLoginPage() {
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [email, setEmail] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    // Handle password login
    setTimeout(() => setIsLoadingPassword(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--accent-base))_0%,transparent_60%)] opacity-[0.08] blur-3xl" />
      </div>

      {/* Card */}
      <Card className="w-full max-w-md relative">
        {/* Header */}
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in with your passkey or password</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Device Detection */}
          <div>
            <PasskeyDeviceDetector showDetails={false} />
          </div>

          {/* Tabs for Passkey vs Password */}
          <Tabs defaultValue="passkey" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="passkey">
                <Fingerprint className="h-4 w-4 mr-2" />
                Passkey
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-2" />
                Password
              </TabsTrigger>
            </TabsList>

            {/* Passkey Tab */}
            <TabsContent value="passkey" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="passkey-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-secondary" />
                  <Input
                    id="passkey-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-fg-secondary">
                Use your device's biometric authentication for a faster, more secure login.
              </p>
              <PasskeyAuthentication
                email={email}
                onSuccess={() => {
                  console.log('Passkey login successful');
                }}
              />
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password" className="space-y-4 mt-6">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-secondary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-secondary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="remember" className="text-sm text-fg-secondary">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={isLoadingPassword}
                  className="w-full"
                >
                  {isLoadingPassword ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/90 underline"
                >
                  Forgot your password?
                </a>
              </div>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-fg-secondary">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm">
            <span className="text-fg-secondary">Don't have an account? </span>
            <a href="/signup" className="text-primary hover:text-primary/90 font-medium">
              Sign up
            </a>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50">
          <p className="text-xs text-center text-fg-tertiary">
            Your security is our priority. We use industry-standard encryption.
          </p>
        </div>
      </Card>
    </div>
  );
}
