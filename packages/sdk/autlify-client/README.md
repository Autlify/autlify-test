# @autlify/client (internal scaffold)

This folder provides an internal SDK surface that can be *aliased* as `@autlify/client` via `tsconfig.json` paths.
It is designed for future extraction into a standalone npm package.

## React (session-based UI)
```ts
import { AutlifyProvider } from '@autlify/client'
```

## Server (API-key)
```ts
import { createAutlifyClient } from '@autlify/client/server'

const client = createAutlifyClient({ baseUrl: process.env.AUTLIFY_BASE_URL })
const api = client.forAgency('agencyId')
const apps = await api.apps.list()
```

**Security:** never ship `AUTLIFY_API_KEY` to the browser. The server entry uses `server-only` and will throw if imported client-side.
