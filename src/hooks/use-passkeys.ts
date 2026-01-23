import { useState, useCallback, useEffect } from 'react';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/types';

interface Passkey {
  id: string;
  name: string;
  deviceName?: string;
  authenticatorType?: string;
  createdAt: string;
  lastUsedAt?: string;
  backupEligible: boolean;
}

interface UsePasskeysReturn {
  passkeys: Passkey[];
  isLoading: boolean;
  error: Error | null;
  addPasskey: (name: string, userId: string, userName: string, userEmail: string) => Promise<void>;
  deletePasskey: (passkeyId: string) => Promise<void>;
  refreshPasskeys: () => Promise<void>;
  authenticate: () => Promise<void>;
}

export function usePasskeys(userId?: string): UsePasskeysReturn {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch passkeys
  const refreshPasskeys = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/passkeys?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch passkeys');
      const data = await response.json();
      setPasskeys(data.passkeys || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    refreshPasskeys();
  }, [refreshPasskeys]);

  // Add passkey
  const addPasskey = useCallback(
    async (name: string, userId: string, userName: string, userEmail: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/passkey/register-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, userName, userEmail }),
        });

        if (!response.ok) throw new Error('Failed to get registration options');
        const options = await response.json();

        // Will throw if user cancels
        const { startRegistration } = await import('@simplewebauthn/browser');
        const attResp = await startRegistration(options);

        // Verify
        const verifyResponse = await fetch('/api/auth/passkey/register-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, passkeyName: name, credential: attResp }),
        });

        if (!verifyResponse.ok) throw new Error('Failed to verify passkey');

        await refreshPasskeys();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshPasskeys]
  );

  // Delete passkey
  const deletePasskey = useCallback(
    async (passkeyId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/passkey/${passkeyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete passkey');

        await refreshPasskeys();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshPasskeys]
  );

  // Authenticate
  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/passkey/authenticate-options');
      if (!response.ok) throw new Error('Failed to get authentication options');
      const options = await response.json();

      const { startAuthentication } = await import('@simplewebauthn/browser');
      const assertionResp = await startAuthentication(options);

      const verifyResponse = await fetch('/api/auth/passkey/authenticate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: assertionResp }),
      });

      if (!verifyResponse.ok) throw new Error('Authentication failed');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    passkeys,
    isLoading,
    error,
    addPasskey,
    deletePasskey,
    refreshPasskeys,
    authenticate,
  };
}
