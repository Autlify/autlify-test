# Type Centralization

This directory contains centralized type definitions for the entire application.

## Structure

- **auth.ts** - Authentication and user types
- **billing.ts** - Billing, invoicing, payment types
- **core.ts** - Core domain types (Scope, Identity)
- **finance.ts** - Financial module types
- **passkey.ts** - Passkey/WebAuthn types
- **preferences.ts** - User preference types
- **pricing.ts** - Pricing and plan types
- **sidebar.ts** - Navigation and sidebar types
- **ui.ts** - UI component types (HierarchyLevel, NavItem, NavVariant, etc.)
- **common/** - Common utility types
  - **result.ts** - ActionResult<T> type with helpers

## ActionResult Pattern

The `ActionResult<T>` type is used throughout the codebase for type-safe action returns:

```typescript
import type { ActionResult } from '@/types/common/result'
// Or with helpers:
import { successResult, errorResult, isActionSuccess } from '@/types/common/result'

async function myAction(): Promise<ActionResult<User>> {
  try {
    const user = await db.user.create({ data })
    return successResult(user)
  } catch (error) {
    return errorResult('Failed to create user')
  }
}
```

## Migration Status

### Phase 1: Critical Duplications ✅
- [x] Centralized ActionResult type (consolidates 40+ duplicates)
- [x] Centralized UI navigation types
- [x] Updated initial files as proof of concept
- [x] Moved from lib/common to types/common

### Phase 2: Automated Migration (Next)

**Option 1: Use Migration Script** (if available in scripts/ directory)
```bash
# Preview changes
bun run scripts/migrate-action-result.ts --dry-run

# Apply migration
bun run scripts/migrate-action-result.ts
```

**Option 2: Manual Search & Replace**
Use your IDE's find-and-replace feature:

1. **Find** (regex enabled):
   ```regex
   type\s+ActionResult<T>\s*=\s*\{\s*success:\s*true;\s*data:\s*T\s*\}\s*\|\s*\{\s*success:\s*false;\s*error:\s*string\s*\}
   ```

2. **Replace with**: (leave empty to remove)

3. **Add import** at the top of each file after existing imports:
   ```typescript
   import type { ActionResult } from '@/types/common/result'
   ```

**Files to migrate** (search for `type ActionResult` in these directories):
- `src/lib/features/fi/general-ledger/actions/` (remaining ~30 files)
- `src/lib/features/fi/bank-ledger/actions/` (~10 files)
- `src/lib/features/fi/accounts-receivable/actions/` (~8 files)
- `src/lib/features/fi/accounts-payable/actions/` (~8 files)
- `src/lib/features/iam/authz/actions/` (~5 files)

### Phase 3: Domain Consolidation (Planned)
- [ ] auth types (Principal, ApiKey)
- [ ] finance types (GL/FI specific)
- [ ] integration types

## Guidelines

1. **Always import from centralized locations** - Never define types locally if a centralized version exists
2. **Add new shared types here** - If a type is used in 2+ files, centralize it
3. **Use domain-specific files** - Group related types together
4. **Document exported types** - Add JSDoc comments for public types

## Benefits

- **Type Safety**: Single source of truth prevents drift
- **Discoverability**: Clear location for all shared types
- **Maintainability**: Changes propagate from one place
- **Consistency**: Eliminates variant implementations
