'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertCircle, Smartphone, Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface Passkey {
  id: string;
  name: string;
  deviceName?: string;
  authenticatorType?: string;
  createdAt: string;
  lastUsedAt?: string;
  backupEligible: boolean;
}

interface PasskeyManagementProps {
  passkeys: Passkey[];
  isLoading?: boolean;
  onDelete?: (passkeyId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function PasskeyManagement({
  passkeys,
  isLoading = false,
  onDelete,
  onRefresh,
}: PasskeyManagementProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
      await onRefresh?.();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date?: string) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  const getAuthenticatorIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'platform':
        return '🍎';
      case 'cross-platform':
        return '🔐';
      default:
        return '📱';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (passkeys.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 p-8 text-center">
        <Smartphone className="mx-auto h-12 w-12 text-fg-tertiary" />
        <h3 className="mt-4 font-semibold text-fg-primary">No Passkeys</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Add your first passkey to enable passwordless sign-in
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {passkeys.map((passkey) => (
        <div
          key={passkey.id}
          className="group rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:bg-card hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            {/* Left: Icon and Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <div className="mt-1 text-2xl">
                {getAuthenticatorIcon(passkey.authenticatorType)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-fg-primary truncate">{passkey.name}</h4>
                  {passkey.backupEligible && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Synced
                    </span>
                  )}
                </div>

                {passkey.deviceName && (
                  <p className="mt-1 text-sm text-fg-secondary">{passkey.deviceName}</p>
                )}

                <div className="mt-2 flex items-center gap-4 text-xs text-fg-tertiary">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Added {formatDate(passkey.createdAt)}
                  </div>
                  {passkey.lastUsedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Used {formatTime(passkey.lastUsedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(passkey.id)}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>

          {/* Backup Info */}
          {passkey.backupEligible && (
            <div className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              ✓ This passkey is synced across your devices
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll no longer be able to sign in with this passkey. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
