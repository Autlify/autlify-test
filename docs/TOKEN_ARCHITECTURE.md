/**
 * @file docs/TOKEN_ARCHITECTURE.md
 * @title Unified Token Architecture
 * @description Consolidated authentication token system for all flows
 */

# Unified Token Architecture

## Overview

All authentication flows use a **single, centralized token system** via `createVerificationToken()` with different scopes for different operations.

**Token Scopes:**
- `verify` - Email verification (registration)
- `passkey` - WebAuthn passkey operations (registration + authentication)
- `authN` - Auto-login after email verification (internal use)

**Central Token Helper:** `src/lib/auth-token.ts`
- `validateAuthToken()` - Core validation logic
- `validateAuthTokenWithResponse()` - HTTP response wrapper
- `tokenErrorResponse()` - Standardized error responses
- `tokenSuccessResponse()` - Delete token + return response

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  VERIFICATION TOKEN SYSTEM                   │
│                                                               │
│  src/lib/queries.ts::createVerificationToken()              │
│  ├─ Scope: 'verify' | 'passkey' | 'authN'                   │
│  ├─ Identifier: `${scope}:${email}`                         │
│  ├─ Token: 32-byte random hex                               │
│  └─ Expires: 5-30 minutes                                   │
│                                                               │
│  src/lib/auth-token.ts::validateAuthToken()                 │
│  ├─ Check token exists                                      │
│  ├─ Check expiration                                        │
│  ├─ Validate scope matches                                  │
│  └─ Return validation result                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Flow Comparison: Before vs After

### BEFORE: Duplicated Logic
```typescript
// /api/auth/register/verify - Email verification
const token = await createVerificationToken(email, 'verify', 24h);
// ... validate, send email

// /api/auth/register/confirm - Confirm email
const validation = await validateVerificationToken(token);
if (validation.scope !== 'verify') return error;
await deleteVerificationToken(token);

// /api/auth/passkey/options - Registration options
const token = await createVerificationToken(email, 'passkey', 15min);
// ... WebAuthn stuff

// /api/auth/passkey/verify - Verify registration
const validation = await validateVerificationToken(token);
if (validation.scope !== 'passkey') return error;
await deleteVerificationToken(token);

// /api/auth/passkey/authenticate/options - Auth options
const token = await createVerificationToken(email, 'passkey', 5min);
// ... WebAuthn stuff

// /api/auth/passkey/authenticate/verify - Verify auth
const validation = await validateVerificationToken(token);
if (validation.scope !== 'passkey') return error;
await deleteVerificationToken(token);

// ❌ PROBLEM: Validation logic repeated 3x
```

### AFTER: Centralized Validation
```typescript
// src/lib/auth-token.ts - Single source of truth
export async function validateAuthToken(
  token: string,
  expectedScope: TokenScope,
  deleteAfter: boolean = false
): Promise<TokenValidationResult> {
  // ✅ All logic in ONE place
  // ✅ Consistent error handling
  // ✅ Reusable across all flows
}

// Usage in ANY endpoint:
const result = await validateAuthToken(token, 'passkey', true);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
// Token is valid and deleted (for reuse prevention)
```

---

## All Flows Using Unified System

### 1. EMAIL VERIFICATION FLOW (scope: 'verify')
```
User Registration
  ↓
POST /api/auth/register/verify { email }
  ├─ createVerificationToken(email, 'verify', 24h)
  ├─ Send email with token link
  └─ Return: { message, cooldownSeconds }
  ↓
Email click: GET /api/auth/register/confirm?token=xxx
  ├─ validateAuthToken(token, 'verify', true) ← Unified
  ├─ Update user.emailVerified
  ├─ Delete token (prevents reuse)
  └─ Redirect with message
```

### 2. PASSKEY REGISTRATION FLOW (scope: 'passkey')
```
Register Passkey
  ↓
POST /api/auth/passkey/options { email, userName }
  ├─ createVerificationToken(email, 'passkey', 15min)
  ├─ generateRegistrationOptions()
  └─ Return: { options, token }
  ↓
POST /api/auth/passkey/verify { email, token, credential }
  ├─ validateAuthToken(token, 'passkey', false) ← Unified
  ├─ verifyRegistrationResponse() via SimpleWebAuthn
  ├─ db.passkey.create()
  ├─ deleteVerificationToken(token) manually
  └─ Return: { success, passkey }
```

### 3. PASSKEY AUTHENTICATION FLOW (scope: 'passkey')
```
Authenticate with Passkey
  ↓
POST /api/auth/passkey/authenticate/options { email }
  ├─ createVerificationToken(email, 'passkey', 5min)
  ├─ generateAuthenticationOptions()
  └─ Return: { options, token }
  ↓
POST /api/auth/passkey/authenticate/verify { email, token, credential }
  ├─ validateAuthToken(token, 'passkey', false) ← Unified
  ├─ verifyAuthenticationResponse() via SimpleWebAuthn
  ├─ Validate counter (clone detection)
  ├─ db.passkey.update() counter & lastUsedAt
  ├─ deleteVerificationToken(token) manually
  └─ Return: { success, userId, user }
```

---

## Token Parameters by Flow

| Flow | Scope | Lifetime | Use Case |
|------|-------|----------|----------|
| Email Verify | `verify` | 24 hours | Email link validity |
| Passkey Register | `passkey` | 15 minutes | WebAuthn registration |
| Passkey Auth | `passkey` | 5 minutes | WebAuthn authentication |
| Auto-Login | `authN` | 5 minutes | Post-email-verify auto-login |

---

## API Routes Structure

```
src/app/api/auth/
├── register/
│   ├── verify/
│   │   └── route.ts (POST: send email, GET: check cooldown)
│   └── confirm/
│       └── route.ts (GET: validate & confirm email)
└── passkey/
    ├── options/
    │   └── route.ts (POST: registration options)
    ├── verify/
    │   └── route.ts (POST: verify & save passkey)
    ├── authenticate/
    │   ├── options/
    │   │   └── route.ts (POST: auth options)
    │   └── verify/
    │       └── route.ts (POST: verify & return user)
    ├── route.ts (GET: list passkeys)
    └── [id]/
        └── route.ts (DELETE/PATCH: manage passkey)
```

---

## Centralized Token Helper Usage

### In Passkey Routes

```typescript
import { validateAuthTokenWithResponse } from '@/lib/auth-token'
import { deleteVerificationToken } from '@/lib/queries'

// In /api/auth/passkey/verify (registration)
const tokenError = await validateAuthTokenWithResponse(token, 'passkey', false);
if (tokenError) return tokenError;
// ... verify credential, save passkey
await deleteVerificationToken(token); // Prevent reuse

// In /api/auth/passkey/authenticate/verify (auth)
const tokenError = await validateAuthTokenWithResponse(token, 'passkey', false);
if (tokenError) return tokenError;
// ... verify assertion, update passkey
await deleteVerificationToken(token); // Prevent replay
```

### Error Handling

```typescript
// All errors go through one place
const result = await validateAuthToken(token, 'passkey');

if (!result.success) {
  // result.error: 'missing-token' | 'invalid-token' | 'expired-token' | 'invalid-scope'
  // result.message: Human readable error
  return NextResponse.json(
    { error: result.error, message: result.message },
    { status: 400 }
  );
}
```

---

## Benefits of Unified System

✅ **DRY (Don't Repeat Yourself)**
- Single source of truth for token validation
- Consistency across all flows

✅ **Maintainability**
- Change validation logic in ONE place
- All endpoints automatically benefit

✅ **Security**
- Consistent error messages (no leaking info)
- Unified scope checking
- Token reuse prevention

✅ **Scalability**
- Easy to add new scopes
- Easy to add new flows
- Extensible error handling

✅ **Testing**
- Test validation logic once
- All endpoints inherit tests

---

## Not Duplicated, Just Sequential

```
Email Verification (scope: verify)
├─ Different operation: send email
├─ Different validation: verify email change
└─ Different lifetime: 24 hours

Passkey Registration (scope: passkey)
├─ Different operation: WebAuthn credential
├─ Different validation: cryptographic verification
└─ Different lifetime: 15 minutes

Passkey Authentication (scope: passkey)
├─ Different operation: WebAuthn assertion
├─ Different validation: signature verification
└─ Different lifetime: 5 minutes
```

They **USE THE SAME TOKEN SYSTEM** but with **DIFFERENT SCOPES** and **DIFFERENT OPERATIONS**.

---

## Summary

| Aspect | Status |
|--------|--------|
| Duplicate routes? | ❌ NO - Different purposes |
| Duplicate token logic? | ✅ YES (FIXED) - Centralized in `auth-token.ts` |
| Can use single handler? | ✅ YES - `validateAuthToken()` |
| Need different endpoints? | ✅ YES - Different operations |
| Can combine endpoints? | ❌ NO - Sequential operations |

**Architecture Result:**
- 6 API endpoints (not combined - different operations)
- 1 token validation system (centralized - reusable)
- 1 auth-token helper (prevents code duplication)
