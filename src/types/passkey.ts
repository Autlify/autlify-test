import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRequestOptions,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

/**
 * Passkey Types
 */

export interface DeviceCapabilities {
  isPlatform: boolean;
  isCrossPlatform: boolean;
  supportsUserVerification: boolean;
  deviceType: 'platform' | 'cross-platform' | 'both' | 'none';
  description: string;
}

export interface PasskeyInfo {
  id: string;
  name: string;
  deviceName?: string;
  authenticatorType?: string;
  createdAt: Date;
  lastUsedAt?: Date;
  backupEligible: boolean;
  backupState: boolean;
}

/**
 * API Request/Response Types
 */

// Register Options
export interface RegisterOptionsRequest {
  userId: string;
  userName: string;
  userEmail: string;
}

export type RegisterOptionsResponse = PublicKeyCredentialCreationOptions;

// Register Verify
export interface RegisterVerifyRequest {
  userId: string;
  passkeyName: string;
  credential: RegistrationResponseJSON;
}

export interface RegisterVerifyResponse {
  success: boolean;
  passkey: PasskeyInfo;
}

// Authenticate Options
export type AuthenticateOptionsResponse = PublicKeyCredentialRequestOptions;

// Authenticate Verify
export interface AuthenticateVerifyRequest {
  credential: AuthenticationResponseJSON;
}

export interface AuthenticateVerifyResponse {
  success: boolean;
  userId: string;
}

// Delete Passkey
export interface DeletePasskeyResponse {
  success: boolean;
}

// List Passkeys
export interface ListPasskeysResponse {
  passkeys: PasskeyInfo[];
}

/**
 * Component Props Types
 */

export interface PasskeyDeviceDetectorProps {
  onCapabilitiesDetected?: (capabilities: DeviceCapabilities) => void;
  showDetails?: boolean;
}

export interface PasskeyRegistrationProps {
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess?: (result: RegisterVerifyResponse) => void;
  onError?: (error: Error) => void;
}

export interface PasskeyAuthenticationProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface PasskeyManagementProps {
  passkeys: PasskeyInfo[];
  isLoading?: boolean;
  onDelete?: (passkeyId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

/**
 * Hook Return Types
 */

export interface UsePasskeysReturn {
  passkeys: PasskeyInfo[];
  isLoading: boolean;
  error: Error | null;
  addPasskey: (name: string, userId: string, userName: string, userEmail: string) => Promise<void>;
  deletePasskey: (passkeyId: string) => Promise<void>;
  refreshPasskeys: () => Promise<void>;
  authenticate: () => Promise<void>;
}
