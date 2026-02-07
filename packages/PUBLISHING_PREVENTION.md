# Publishing Prevention Checklist

## ✅ Both Packages Are Protected

### Billing SDK (`@autlify/billing-sdk`)
- ✅ `"private": true` in package.json
- ✅ `"license": "UNLICENSED"` 
- ✅ `prepublishOnly` script blocks publishing
- ✅ LICENSE file states proprietary terms
- ✅ README warns about API key requirement
- ✅ License validation in src/license.ts

### MCP Server (`@autlify/mcp-server`)  
- ✅ `"private": true` in package.json
- ✅ `"license": "UNLICENSED"`
- ✅ `prepublishOnly` script blocks publishing
- ✅ LICENSE file states internal use only
- ✅ README warns about internal use only

## What Happens If Someone Tries to Publish?

### Attempt 1: npm publish
```bash
npm publish
# ❌ Error: This package has been marked as private
# Remove the 'private' field from the package.json to publish it.
```

### Attempt 2: Remove "private" field and try again
```bash
npm publish
# ❌ Error: prepublishOnly script failed
# Package is private
```

### Attempt 3: Remove prepublishOnly and try again
```bash
npm publish
# ⚠️ Would publish BUT:
# - License is "UNLICENSED" (shows in npm)
# - LICENSE file clearly states proprietary
# - API key validation enforced in code
# - Whitelisted domains only work for naropo.com
```

## License Enforcement

### Billing SDK
```typescript
import { initLicense } from "@autlify/billing-sdk"

// Validates on initialization
await initLicense({
  apiKey: process.env.AUTLIFY_API_KEY
})
```

**What it checks:**
1. Is domain whitelisted? (localhost, *.naropo.com, *.autlify.dev)
2. If not whitelisted, is API key provided?
3. If API key provided, validate with api.naropo.com
4. Track usage and enforce limits

**Whitelisted domains (no API key needed):**
- `localhost`
- `127.0.0.1`
- `*.naropo.com`
- `*.autlify.dev`

**Non-whitelisted domains:**
- Require valid API key from https://naropo.com/dashboard/api-keys
- API key validated against https://api.naropo.com/v1/validate-key
- Usage tracked and limited by subscription tier

### MCP Server
- Internal use only
- No external authentication (assumes internal network)
- Should only be installed for Autlify team members

## Similar To: PayKit Model

Like https://www.usepaykit.dev/docs/introduction:

| Feature | PayKit | Autlify Billing SDK |
|---------|--------|---------------------|
| License | Proprietary | ✅ UNLICENSED |
| API Key | Required | ✅ Required (except whitelisted) |
| Whitelisting | No | ✅ Yes (internal domains) |
| Usage Tracking | Yes | ✅ Yes |
| Subscription Tiers | Yes | ✅ Free/Pro/Enterprise |
| Open Source | No | ✅ No |

## Internal Development Workflow

### For Autlify Team:

```bash
# 1. Clone repo
git clone https://github.com/autlify/autlify

# 2. Install dependencies
bun install

# 3. Build packages
cd packages/billing-sdk && bun run build
cd packages/autlify-mcp && bun run build

# 4. Link for local use
cd packages/billing-sdk && bun link
cd packages/autlify-mcp && bun link

# 5. Use in development (no API key needed on localhost)
# Components automatically work on whitelisted domains
```

### For External Users (Future):

```bash
# 1. Get API key from dashboard
# https://naropo.com/dashboard/api-keys

# 2. Set environment variable
export AUTLIFY_API_KEY=sk_live_...

# 3. Install SDK
bunx @autlify/billing-sdk add subscription-card

# 4. Initialize in app
import { initLicense } from "@autlify/billing-sdk"
await initLicense({ apiKey: process.env.AUTLIFY_API_KEY })

# 5. Use components
import { SubscriptionCard } from "@autlify/billing-sdk"
```

## Accidental Publish Recovery

If somehow published:

1. **Immediately unpublish**
   ```bash
   npm unpublish @autlify/billing-sdk@<version> --force
   npm unpublish @autlify/mcp-server@<version> --force
   ```

2. **Check npm registry**
   ```bash
   npm view @autlify/billing-sdk
   npm view @autlify/mcp-server
   ```

3. **Verify license is still UNLICENSED**
   - Shows on npm as "UNLICENSED"
   - Discourages usage

4. **API key validation still works**
   - Even if code is public, API key required
   - Can revoke keys remotely
   - Track unauthorized usage

## Summary

🔒 **Both packages are fully protected from accidental publishing**

Three layers of protection:
1. ✅ `"private": true` - npm refuses to publish
2. ✅ `prepublishOnly` - script blocks if private removed  
3. ✅ API key validation - code enforcement even if published

Internal team can freely use on whitelisted domains without friction!
