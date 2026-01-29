# Autlify MCP Server

**⚠️ INTERNAL USE ONLY - Proprietary Software**

General-purpose Model Context Protocol server for Autlify. **Not for external distribution.**

## Access Restrictions

- ✅ Autlify employees only
- ✅ Authorized contractors only  
- ❌ NOT for public use
- ❌ NOT open source

## Features

- 🔍 **Multi-Registry Support** - Access components from billing-sdk, ui-components, and more
- 🤖 **AI-Powered Discovery** - Smart component suggestions based on your needs
- 📦 **Unified Interface** - Single MCP server for all Autlify tools
- 🎯 **Intelligent Search** - Find components across all registries
- 📚 **Comprehensive Docs** - Instant access to documentation and examples
- 🛠️ **Installation Guides** - Step-by-step setup for any package manager

## Installation

```bash
# Global installation
bun add -g @autlify/mcp-server

# Or use npx/bunx without installing
bunx @autlify/mcp-server
```

## Quick Start

### Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "autlify": {
      "command": "autlify-mcp"
    }
  }
}
```

Restart Claude Desktop, then ask:

> "What component registries are available in Autlify?"

> "Show me all billing components"

> "I need to build a subscription management page, what components should I use?"

## Available Registries

### Currently Supported

- **billing-sdk** - Premium billing and subscription components (18 components)
  - Subscriptions, payments, invoices, credits, usage tracking

### Coming Soon

- **ui-components** - Core UI primitives and patterns
- **data-viz** - Charts, graphs, and data visualization
- **forms** - Advanced form components with validation
- **auth** - Authentication UI components

## Tools

### `list_registries`

Get all available component registries.

```typescript
list_registries()
// Returns: billing-sdk, ui-components, etc.
```

### `list_components`

List components with filtering.

```typescript
list_components({
  registry: "billing-sdk",     // Optional: specific registry
  category: "subscription",     // Optional: filter by category
  search: "payment"            // Optional: search term
})
```

### `get_component`

Get detailed component information.

```typescript
get_component({
  name: "subscription-card",
  registry: "billing-sdk"     // Optional if name is unique
})
```

###`suggest_components`

AI-powered component suggestions.

```typescript
suggest_components({
  useCase: "I need to show user's subscription and provide upgrade options",
  features: ["plan comparison", "billing history"],
  registry: "billing-sdk"     // Optional: limit to specific registry
})
```

### `get_installation_guide`

Step-by-step installation instructions.

```typescript
get_installation_guide({
  components: ["subscription-card", "payment-form"],
  packageManager: "bun"       // npm, bun, yarn, or pnpm
})
```

### `search_all`

Search across all registries.

```typescript
search_all({
  query: "payment"
})
```

## Claude Usage Examples

### Finding Components

> **You:** "What billing components are available?"
>
> **Claude:** *Uses list_components with registry="billing-sdk"*

### Building Features

> **You:** "I'm building a checkout page. What components do I need?"
>
> **Claude:** *Uses suggest_components to recommend payment-form, invoice-list, etc.*

### Installation Help

> **You:** "How do I install the subscription-card component?"
>
> **Claude:** *Uses get_installation_guide to provide step-by-step instructions*

## Adding New Registries

To add a new component registry:

1. **Create registry file** in `src/registries/your-registry.ts`:

```typescript
export const yourRegistry: Record<string, ComponentRegistry> = {
  "your-component": {
    name: "your-component",
    description: "Component description",
    category: "ui",
    dependencies: ["react"],
    registryDependencies: ["button"],
    files: [{ name: "your-component.tsx" }],
    meta: {
      source: "https://github.com/autlify/your-sdk",
      docs: "/site/docs/your-sdk",
    },
  },
}
```

2. **Register in index** (`src/registries/index.ts`):

```typescript
import { yourRegistry } from "./your-registry.js"

export const registries = {
  "billing-sdk": billingSDK,
  "your-sdk": {
    name: "your-sdk",
    version: "0.1.0",
    description: "Your component library",
    components: yourRegistry,
    categories: ["ui", "layout"],
  },
}
```

3. **Rebuild**:

```bash
bun run build
```

## Development

```bash
# Setup
cd packages/autlify-mcp
bun install

# Build
bun run build

# Watch mode
bun run dev

# Link locally
bun link

# Test
node dist/index.js
```

## Architecture

```
packages/autlify-mcp/
├── src/
│   ├── index.ts              # MCP server implementation
│   ├── types.ts              # Shared type definitions
│   └── registries/
│       ├── index.ts          # Registry aggregator
│       ├── billing-sdk.ts    # Billing components registry
│       └── <future>.ts       # Additional registries
├── dist/                     # Build output
└── package.json
```

## Why Multi-Registry?

Unlike the billing-sdk-specific MCP server, this general server:

- ✅ **Scales** - Add new registries without creating new servers
- ✅ **Unified** - Single configuration for all Autlify tools
- ✅ **Flexible** - Search across all components or filter by registry
- ✅ **Future-Proof** - Ready for new component libraries
- ✅ **Simpler** - One MCP server to configure and maintain

## Troubleshooting

**Server not found:**
```bash
which autlify-mcp
# If empty, reinstall or use bunx @autlify/mcp-server
```

**Build errors:**
```bash
bun run clean
bun install
bun run build
```

**Claude not detecting:**
- Verify config file location
- Check JSON syntax
- Restart Claude Desktop completely
- Test server directly: `autlify-mcp`

## Related Projects

- [@autlify/billing-sdk](../billing-sdk/) - Billing components + CLI
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)

## License

**PROPRIETARY - INTERNAL USE ONLY**

This software is confidential and proprietary to Autlify.

- ❌ Not open source
- ❌ No external distribution  
- ❌ Employees and authorized contractors only
- See [LICENSE](./LICENSE) for full terms
