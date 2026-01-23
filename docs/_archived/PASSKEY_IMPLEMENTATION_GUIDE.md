# Passkey Implementation Guide

## 🎯 Setup Overview

Complete passkey (WebAuthn) authentication with Apple-style UI components. Auto-detects Face ID, Touch ID, Windows Hello, and hardware keys.

## 📦 What's Included

### 1. **Utilities** (`src/lib/webauthn.ts`)
- ✅ Device capability detection
- ✅ Authenticator type identification (platform vs cross-platform)
- ✅ User verification support checking
- ✅ WebAuthn registration/authentication flows

### 2. **Components** (`src/components/auth/passkey/`)

#### `PasskeyDeviceDetector.tsx`
Auto-detects device capabilities with Apple-style design
```tsx
import { PasskeyDeviceDetector } from '@/components/auth/passkey';

<PasskeyDeviceDetector 
  showDetails={true}
  onCapabilitiesDetected={(caps) => console.log(caps)}
/>
```

#### `PasskeyRegistration.tsx`
Dialog for creating new passkeys
```tsx
import { PasskeyRegistration } from '@/components/auth/passkey';

<PasskeyRegistration
  userId={user.id}
  userName={user.name}
  userEmail={user.email}
  onSuccess={(result) => console.log('Passkey created')}
/>
```

#### `PasskeyAuthentication.tsx`
Button for signing in with passkey
```tsx
import { PasskeyAuthentication } from '@/components/auth/passkey';

<PasskeyAuthentication
  onSuccess={() => router.push('/dashboard')}
/>
```

#### `PasskeyManagement.tsx`
Apple-style list of user's passkeys
```tsx
import { PasskeyManagement } from '@/components/auth/passkey';

<PasskeyManagement
  passkeys={passkeys}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
/>
```

#### `PasskeySettingsPage.tsx`
Complete settings page with all components
```tsx
import { PasskeySettingsPage } from '@/components/auth/passkey';

<PasskeySettingsPage />
```

### 3. **Hook** (`src/hooks/use-passkeys.ts`)
```tsx
import { usePasskeys } from '@/hooks/use-passkeys';

const {
  passkeys,
  isLoading,
  error,
  addPasskey,
  deletePasskey,
  refreshPasskeys,
  authenticate,
} = usePasskeys(userId);
```

## 🗄️ Database Setup

Add Passkey model to `prisma/schema.prisma`:

```prisma
model Passkey {
  id                String   @id @default(uuid())
  userId            String
  credentialId      String   @unique @db.Text
  publicKey         String   @db.Text
  counter           Int      @default(0)
  name              String   @default("Passkey")
  deviceName        String?
  authenticatorType String?  // "platform" or "cross-platform"
  backupEligible    Boolean  @default(false)
  backupState       Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastUsedAt        DateTime?
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([credentialId])
}
```

Update User model:
```prisma
model User {
  // ... existing fields ...
  Passkeys Passkey[]
}
```

Run migrations:
```bash
bunx prisma migrate dev --name add_passkey
```

## 🔌 API Routes (You Need to Implement)

Create these endpoints in your `app/api/auth/passkey/` directory:

### 1. `register-options.ts` (POST)
```typescript
import { generateRegistrationOptions } from '@simplewebauthn/server';

// Request: { userId, userName, userEmail }
// Response: RegistrationOptions
```

### 2. `register-verify.ts` (POST)
```typescript
import { verifyRegistrationResponse } from '@simplewebauthn/server';

// Request: { userId, passkeyName, credential }
// 1. Verify credential with @simplewebauthn/server
// 2. Save Passkey model with verified data
// 3. Return success
```

### 3. `authenticate-options.ts` (GET)
```typescript
import { generateAuthenticationOptions } from '@simplewebauthn/server';

// Response: AuthenticationOptions for all registered passkeys
```

### 4. `authenticate-verify.ts` (POST)
```typescript
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

// Request: { credential }
// 1. Verify credential
// 2. Update counter (prevent cloning)
// 3. Update lastUsedAt
// 4. Sign user in
// 5. Return userId
```

### 5. `[id].ts` (DELETE)
```typescript
// Delete passkey by ID
// Check authorization first
```

### 6. `passkeys.ts` (GET)
```typescript
// Query: userId
// Return user's passkeys
```

## 🎨 Features

✅ **Apple-Style Design**
- Smooth animations
- Elegant card layouts
- Glassmorphism effects
- Responsive design

✅ **Auto Detection**
- Face ID / Touch ID (iOS, macOS)
- Windows Hello
- Android biometrics
- Security keys (USB, NFC, Bluetooth)

✅ **User-Friendly**
- Device naming
- Usage tracking
- Backup/sync indicators
- Clear error messages

✅ **Secure**
- Counter validation (prevent cloning)
- User verification
- Backup eligible tracking
- Comprehensive audit logging

## 🚀 Usage Examples

### Settings Page
```tsx
import { PasskeySettingsPage } from '@/components/auth/passkey';

export default function SettingsPage() {
  return <PasskeySettingsPage />;
}
```

### Login Page
```tsx
import { PasskeyAuthentication, PasskeyDeviceDetector } from '@/components/auth/passkey';

export default function LoginPage() {
  return (
    <div>
      <PasskeyDeviceDetector />
      <PasskeyAuthentication />
    </div>
  );
}
```

### Profile Page with Management
```tsx
'use client';

import { usePasskeys } from '@/hooks/use-passkeys';
import { PasskeyRegistration, PasskeyManagement } from '@/components/auth/passkey';

export default function ProfilePage() {
  const { passkeys, deletePasskey, refreshPasskeys } = usePasskeys(userId);

  return (
    <div>
      <PasskeyRegistration 
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        onSuccess={refreshPasskeys}
      />
      <PasskeyManagement 
        passkeys={passkeys}
        onDelete={deletePasskey}
        onRefresh={refreshPasskeys}
      />
    </div>
  );
}
```

## 📱 Device Support

| Device | Face ID | Touch ID | Windows Hello | Security Keys |
|--------|---------|----------|---------------|---------------|
| iPhone/iPad | ✅ | ✅ | ❌ | ❌ |
| Mac | ✅ | ✅ | ❌ | ✅ |
| Windows | ❌ | ❌ | ✅ | ✅ |
| Android | ❌ | ✅ | ❌ | ✅ |
| Linux | ❌ | ❌ | ❌ | ✅ |

## 🔐 Security Considerations

1. **Counter Validation** - Prevent cloned authenticators
2. **User Verification** - Require device authentication
3. **HTTPS Only** - WebAuthn requires secure context
4. **RP ID** - Set correctly in environment variables
5. **Origin Matching** - WebAuthn verifies origin

## 📚 Dependencies

- `@simplewebauthn/browser` - Client-side WebAuthn
- `@simplewebauthn/server` - Server-side verification
- `@simplewebauthn/types` - TypeScript types

Already installed! ✅

## 🎯 Next Steps

1. ✅ Add Passkey model to database
2. ✅ Run migrations
3. Create API routes for registration/authentication
4. Set up environment variables (RP_ID, RP_NAME, ORIGIN)
5. Test on different devices
6. Add MFA/backup codes
7. Set up audit logging

## 💡 Tips

- Encourage users to add multiple passkeys (one for each device)
- Provide recovery codes in case user loses all passkeys
- Use device names like "My iPhone" vs generic "Passkey"
- Test with real devices (Face ID, Touch ID, Windows Hello)
- Collect analytics on device types and adoption rates

---

**You're all set!** Start integrating passkeys into your app today. 🚀
