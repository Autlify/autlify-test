/**
 * @file docs/PASSKEY_API_COMPLETE_GUIDE.md
 * @title Complete Passkey API Implementation Guide
 * @description Full reference for passkey authentication with token flow
 */

# Complete Passkey API Implementation Guide

## Overview

The passkey system uses `createVerificationToken` with scope `'passkey'` to manage the authentication flow. This provides secure, time-limited tokens for both registration and authentication flows.

## Token Flow Architecture

```
User Flow → createVerificationToken(email, 'passkey', expiry)
            ↓
            identifier: 'passkey:email'
            token: random 32-byte hex
            expires: Date (15-30 min)
            ↓
            Used for registration/authentication verification
            ↓
            validateVerificationToken(token)
            ↓
            deleteVerificationToken(token) (after success)
```

## API Routes Structure

```
src/app/api/auth/passkey/
├── options/route.ts                    # GET registration options
├── verify/route.ts                     # POST verify registration
├── authenticate/
│   ├── options/route.ts               # POST get auth options
│   └── verify/route.ts                # POST verify authentication
├── route.ts                            # GET all passkeys for user
└── [id]/route.ts                       # DELETE/PATCH passkey
```

## API Endpoints Reference

### 1. GET Registration Options
**Endpoint:** `POST /api/auth/passkey/options`

**Purpose:** Start passkey registration process

**Request Body:**
```typescript
{
  email: string;        // User email
  userName: string;     // User display name
}
```

**Response:**
```typescript
{
  options: PublicKeyCredentialCreationOptionsJSON;
  token: string;        // Verification token (15 min expiry)
  expiresAt: Date;      // Token expiration
}
```

**Token Usage:**
- Scope: `'passkey'`
- Expiry: 15 minutes
- Used in: Verify registration endpoint

**Process:**
1. Creates verification token with `createVerificationToken(email, 'passkey', 15 * 60 * 1000)`
2. Generates WebAuthn registration options
3. Client stores `token` for next step

---

### 2. Verify Registration
**Endpoint:** `POST /api/auth/passkey/verify`

**Purpose:** Verify credential and save passkey

**Request Body:**
```typescript
{
  email: string;
  token: string;                        // From options endpoint
  credential: RegistrationResponseJSON; // From browser WebAuthn API
  deviceName: string;                   // e.g., "iPhone 15", "MacBook Pro"
  authenticatorType: 'platform' | 'cross-platform';
}
```

**Response:**
```typescript
{
  success: true;
  passkey: {
    id: string;
    name: string;
    createdAt: Date;
    authenticatorType: string;
  };
}
```

**Token Usage:**
- Validates token scope = `'passkey'`
- Deletes token after successful verification (prevents reuse)
- Prevents registration without valid token

**Database Operations:**
```prisma
Passkey {
  userId: string;
  credentialId: string;      // From credential.response.id
  publicKey: string;         // Base64 encoded
  counter: 0;                // Initial counter
  name: string;              // Device name
  deviceName: string;        // Same as name
  authenticatorType: string;
  backupEligible: boolean;
  backupState: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: null;          // Will update on authentication
}
```

---

### 3. Get Authentication Options
**Endpoint:** `POST /api/auth/passkey/authenticate/options`

**Purpose:** Get WebAuthn authentication options

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  options: PublicKeyCredentialRequestOptionsJSON;
  token: string;             // Verification token (5 min expiry)
  expiresAt: Date;
}
```

**Token Usage:**
- Scope: `'passkey'`
- Expiry: 5 minutes (shorter for auth)
- Used in: Verify authentication endpoint

**Process:**
1. Gets all active passkeys for user
2. Builds `allowCredentials` from all passkeys
3. Creates token for authentication verification

---

### 4. Verify Authentication
**Endpoint:** `POST /api/auth/passkey/authenticate/verify`

**Purpose:** Verify authentication assertion

**Request Body:**
```typescript
{
  email: string;
  token: string;                          // From options endpoint
  credential: AuthenticationResponseJSON;  // From browser WebAuthn API
}
```

**Response:**
```typescript
{
  success: true;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}
```

**Token Usage:**
- Validates token scope = `'passkey'`
- Deletes token after successful authentication (prevents replay)

**Security Features:**
1. **Counter Validation:** Checks counter increment to detect cloning
2. **Token Reuse Prevention:** Tokens are deleted after use
3. **Time Limiting:** 5-minute expiry prevents brute force
4. **User Verification:** Optional enforcement of biometric/PIN

**Database Updates:**
```prisma
Passkey.update({
  counter: verification.authenticationInfo.newCounter,
  lastUsedAt: new Date(),
})
```

---

### 5. List User Passkeys
**Endpoint:** `GET /api/auth/passkey?userId=optional`

**Purpose:** Get all passkeys for user

**Query Parameters:**
```typescript
{
  userId?: string;  // Optional, defaults to session user
}
```

**Response:**
```typescript
{
  passkeys: Array<{
    id: string;
    name: string;
    deviceName: string;
    authenticatorType: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    backupEligible: boolean;
  }>;
}
```

**Security:** Requires authentication, validates user can only access their own

---

### 6. Update Passkey Name
**Endpoint:** `PATCH /api/auth/passkey/[id]`

**Purpose:** Rename a passkey

**Request Body:**
```typescript
{
  deviceName: string;  // New device name
}
```

**Response:**
```typescript
{
  success: true;
  passkey: {
    id: string;
    name: string;
    deviceName: string;
    authenticatorType: string;
    createdAt: Date;
    lastUsedAt: Date | null;
  };
}
```

---

### 7. Delete Passkey
**Endpoint:** `DELETE /api/auth/passkey/[id]`

**Purpose:** Delete a passkey permanently

**Response:**
```typescript
{
  success: boolean;
}
```

**Security:** User can only delete their own passkeys

---

## Token Scope: 'passkey'

The `'passkey'` scope is specifically for WebAuthn operations.

### Token Creation (in registration flow):
```typescript
const token = await createVerificationToken(
  email,              // 'passkey:email'
  'passkey',          // Scope identifier
  15 * 60 * 1000      // 15 minutes for registration
);
// Returns: { token, expires }
```

### Token Creation (in authentication flow):
```typescript
const token = await createVerificationToken(
  email,
  'passkey',
  5 * 60 * 1000       // 5 minutes for authentication
);
```

### Token Validation:
```typescript
const validation = await validateVerificationToken(token);
if (!validation.success) {
  // Token invalid, expired, or doesn't exist
  return error;
}

// Check scope for passkey operations
if (validation.scope !== 'passkey') {
  return error; // Wrong token type
}
```

### Token Deletion (after success):
```typescript
await deleteVerificationToken(token);
// Prevents token reuse
```

---

## Error Handling

### Common Errors:

| Error | HTTP Status | Cause |
|-------|-----------|-------|
| `invalid-token` | 400 | Token doesn't exist or wrong format |
| `expired-token` | 400 | Token past expiration time |
| `invalid-scope` | 400 | Token scope is not 'passkey' |
| `verification-failed` | 400 | WebAuthn verification failed |
| `clone-detected` | 400 | Counter validation failed - possible clone |
| `user-not-found` | 404 | User email not found |
| `passkey-not-found` | 404 | Passkey ID not found |
| `unauthorized` | 401 | Not authenticated |
| `forbidden` | 403 | User accessing other's passkey |

---

## Frontend Integration Example

```typescript
// Step 1: Get registration options
async function startRegistration(email: string, userName: string) {
  const res = await fetch('/api/auth/passkey/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, userName }),
  });
  
  const data = await res.json();
  return data; // { options, token }
}

// Step 2: Create credential via WebAuthn
async function createCredential(options) {
  const credential = await navigator.credentials.create({
    publicKey: options,
  });
  return credential;
}

// Step 3: Verify registration
async function verifyRegistration(email, token, credential, deviceName) {
  const res = await fetch('/api/auth/passkey/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      token,
      credential: credential.toJSON(),
      deviceName,
      authenticatorType: 'platform',
    }),
  });
  
  return res.json();
}

// Authentication flow (similar pattern)
async function getAuthOptions(email: string) {
  const res = await fetch('/api/auth/passkey/authenticate/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  return res.json(); // { options, token }
}

async function verifyAuthentication(email, token, credential) {
  const res = await fetch('/api/auth/passkey/authenticate/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      token,
      credential: credential.toJSON(),
    }),
  });
  
  const data = await res.json();
  // On success: { success: true, userId, user }
  return data;
}
```

---

## Security Considerations

### 1. Token Lifetime
- **Registration:** 15 minutes (user needs time to complete biometric)
- **Authentication:** 5 minutes (quick operation)
- Tokens expire automatically
- Cannot be reused after successful verification

### 2. Counter Validation
```typescript
// Prevents credential cloning
if (newCounter <= previousCounter) {
  // Possible clone detected
  // Option 1: Reject authentication
  // Option 2: Disable passkey
  // Option 3: Alert user
}
```

### 3. User Verification
- Optional enforcement of biometric/PIN
- Recommended for sensitive operations
- Check `userVerificationRequired` during auth

### 4. Origin/RP ID Validation
- Ensures credential created for correct domain
- Prevents cross-domain attacks
- Must match `process.env.NEXTAUTH_URL`

### 5. Challenge Randomness
- SimpleWebAuthn generates random challenges
- Prevents replay attacks
- Validated against client's clientDataJSON

---

## Implementation Checklist

- [ ] Create Passkey model in schema.prisma
- [ ] Run migration: `bunx prisma migrate dev`
- [ ] Regenerate Prisma client: `bunx prisma generate`
- [ ] Create `/api/auth/passkey/options/route.ts`
- [ ] Create `/api/auth/passkey/verify/route.ts`
- [ ] Create `/api/auth/passkey/authenticate/options/route.ts`
- [ ] Create `/api/auth/passkey/authenticate/verify/route.ts`
- [ ] Create `/api/auth/passkey/route.ts` (GET, LIST)
- [ ] Create `/api/auth/passkey/[id]/route.ts` (DELETE, PATCH)
- [ ] Add PasskeyRegistration component to signup flow
- [ ] Add PasskeyAuthentication component to login flow
- [ ] Add PasskeyManagement component to settings
- [ ] Test registration flow end-to-end
- [ ] Test authentication flow end-to-end
- [ ] Test token expiration
- [ ] Test clone detection
- [ ] Test error handling

---

## Environment Variables

```env
# Must be set for WebAuthn to work
NEXTAUTH_URL=http://localhost:3000  # or production URL
AUTH_COOLDOWN_MINUTES=60             # Optional, for rate limiting
```

---

## References

- [SimpleWebAuthn Server Docs](https://simplewebauthn.dev/docs/packages/server)
- [WebAuthn Standard](https://www.w3.org/TR/webauthn-2/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
