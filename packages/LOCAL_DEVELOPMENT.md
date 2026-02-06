# Local Development Guide

## Using Packages Locally

Both `@autlify/billing-sdk` and `@autlify/mcp-server` are **private packages** for internal use only.

### Current Status

✅ **Private**: Both packages marked as `private: true`  
✅ **Linked**: Using `bun link` for local testing  
✅ **Editable**: Full access to update/fix bugs  
❌ **Not Published**: Protected from accidental npm publish

### Local Setup

#### 1. Billing SDK

```bash
# Build the package
cd packages/billing-sdk
bun install
bun run build

# Link for local use
bun link

# Use in main project
cd ../..
bun link @autlify/billing-sdk

# Test the CLI locally
cd packages/billing-sdk
node dist/cli.js list
```

#### 2. MCP Server

```bash
# Build the package
cd packages/autlify-mcp
bun install
bun run build

# Link for local use
bun link

# Test it works
node dist/index.js
# Should see: "Autlify MCP server running"
```

### Development Workflow

#### Making Changes to Billing SDK

```bash
cd packages/billing-sdk

# 1. Edit components in src/components/billing-sdk/
# 2. Update registry if needed: src/registry.ts
# 3. Rebuild
bun run build

# 4. Changes are immediately available in linked projects
```

#### Making Changes to MCP Server

```bash
cd packages/autlify-mcp

# 1. Edit tools in src/index.ts
# 2. Add new registries in src/registries/
# 3. Rebuild
bun run build

# 4. Restart MCP server in Claude Desktop (restart app)
```

### Watch Mode (Auto-Rebuild)

```bash
# Billing SDK - auto-rebuild on changes
cd packages/billing-sdk
bun run dev

# MCP Server - auto-rebuild on changes
cd packages/autlify-mcp
bun run dev
```

### Using Components in Main Project

Since billing SDK is linked:

```tsx
// Import components directly
import { SubscriptionCard } from "@/components/billing-sdk"

// Or use the CLI to install new components
bunx @autlify/billing-sdk add payment-form
```

### Fixing Bugs

#### In Components

1. Edit component file: `src/components/billing-sdk/your-component.tsx`
2. Test locally in your app
3. Commit changes to main project (components are in main codebase)

#### In SDK CLI/Build System

1. Edit files in `packages/billing-sdk/`
2. Rebuild: `bun run build`
3. Test: `node dist/cli.js <command>`
4. Commit changes

#### In MCP Server

1. Edit files in `packages/autlify-mcp/`
2. Rebuild: `bun run build`
3. Restart Claude Desktop to pick up changes
4. Commit changes

### Safety Features

#### Protected from Publish

Both packages have `prepublishOnly` script that prevents accidental publishing:

```json
{
  "private": true,
  "scripts": {
    "prepublishOnly": "echo 'Package is private' && exit 1"
  }
}
```

If you try `npm publish`, it will fail with:
```
Package is private
```

### File Locations

```
autlify/
├── src/components/billing-sdk/    # Actual component source (main project)
│   ├── subscription-card.tsx
│   ├── payment-form.tsx
│   └── ... (18 components)
│
├── packages/
│   ├── billing-sdk/                # SDK package (CLI + registry)
│   │   ├── bin/cli.ts             # CLI tool
│   │   ├── src/
│   │   │   ├── index.ts           # Package entry
│   │   │   └── registry.ts        # Component metadata
│   │   └── dist/                  # Built output
│   │
│   └── autlify-mcp/                # MCP server (private)
│       ├── src/
│       │   ├── index.ts           # MCP server
│       │   ├── types.ts           # Shared types
│       │   └── registries/        # Component registries
│       └── dist/                  # Built output
```

### Removing Private Status (Future)

When ready to publish externally:

1. Remove `"private": true` from package.json
2. Remove `prepublishOnly` script
3. Update repository URLs to public repo
4. Run `npm publish --access public`

But for now, keep as **private** for internal development! 🔒

### Quick Reference

```bash
# Build all packages
cd packages/billing-sdk && bun run build
cd packages/autlify-mcp && bun run build

# Link all packages
cd packages/billing-sdk && bun link
cd packages/autlify-mcp && bun link

# Watch mode for development
cd packages/billing-sdk && bun run dev  # Terminal 1
cd packages/autlify-mcp && bun run dev  # Terminal 2

# Test CLI
node packages/billing-sdk/dist/cli.js list

# Test MCP server
node packages/autlify-mcp/dist/index.js
```
