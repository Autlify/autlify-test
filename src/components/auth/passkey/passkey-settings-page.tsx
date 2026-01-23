'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePasskeys } from '@/hooks/use-passkeys';
import { PasskeyDeviceDetector } from '@/components/auth/passkey/passkey-device-detector';
import { PasskeyRegistration } from '@/components/auth/passkey/passkey-registration';
import { PasskeyManagement } from '@/components/auth/passkey/passkey-management';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Shield, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PasskeySettingsPage() {
  const { data: session } = useSession();
  const { passkeys, isLoading, error, deletePasskey, refreshPasskeys, addPasskey } = usePasskeys(
    session?.user?.id
  );

  const user = session?.user;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-fg-primary">Security Settings</h1>
        <p className="mt-2 text-fg-secondary">Manage your passkeys and authentication methods</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">Error</p>
              <p className="mt-1 text-sm text-red-800 dark:text-red-200">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="passkeys" className="w-full">
        <TabsList>
          <TabsTrigger value="passkeys" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Passkeys
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Passkeys Tab */}
        <TabsContent value="passkeys" className="space-y-6">
          {/* Device Detection */}
          <Card>
            <CardHeader>
              <CardTitle>Device Capability</CardTitle>
              <CardDescription>
                Check what authentication methods your device supports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasskeyDeviceDetector showDetails={true} />
            </CardContent>
          </Card>

          {/* Add Passkey */}
          <Card>
            <CardHeader>
              <CardTitle>Add a New Passkey</CardTitle>
              <CardDescription>
                Create a passkey for faster, more secure sign-ins on this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <h4 className="font-semibold text-fg-primary mb-2">What is a passkey?</h4>
                <ul className="space-y-2 text-sm text-fg-secondary">
                  <li>✓ Sign in with Face ID, Touch ID, or Windows Hello</li>
                  <li>✓ More secure than passwords</li>
                  <li>✓ Works across your Apple/Windows devices</li>
                  <li>✓ Can also use hardware security keys</li>
                </ul>
              </div>

              {user && (
                <PasskeyRegistration
                  userId={user.id}
                  userName={user.name || 'User'}
                  userEmail={user.email || ''}
                  onSuccess={() => {
                    refreshPasskeys();
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Your Passkeys */}
          <Card>
            <CardHeader>
              <CardTitle>Your Passkeys</CardTitle>
              <CardDescription>
                Manage the passkeys you've created for signing in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasskeyManagement
                passkeys={passkeys}
                isLoading={isLoading}
                onDelete={deletePasskey}
                onRefresh={refreshPasskeys}
              />
            </CardContent>
          </Card>

          {/* Backup Codes Info */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">Keep Your Recovery Codes Safe</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-200">
              <p>
                If you lose access to all your passkeys, you can use recovery codes to regain access to your account.
                Save these codes in a secure location.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-fg-secondary">Coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-fg-secondary">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
