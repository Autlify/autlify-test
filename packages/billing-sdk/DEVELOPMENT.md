# Billing SDK Development Guide

## Package Structure

```
packages/billing-sdk/
├── bin/
│   └── cli.ts              # CLI tool source
├── src/
│   ├── index.ts            # Main exports
│   └── registry.ts         # Component registry
├── dist/                   # Build output (gitignored)
├── package.json
├── tsconfig.json
├── tsup.config.ts          # Build configuration
└── README.md
```

## Development

### Prerequisites

- Bun v1.3+
- Node.js v18+
- TypeScript v5.0+

### Setup

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Link for local testing
bun link

# Watch mode for development
bun run dev
```

### Building

The package uses [tsup](https://tsup.egoist.dev/) for building:

- **Library build**: Creates CJS, ESM, and TypeScript definitions
- **CLI build**: Creates optimized Node.js executable

```bash
# Build everything
bun run build

# Clean build
rm -rf dist && bun run build

# Type checking only
bun run typecheck
```

### Testing the CLI

```bash
# After building, test locally
node dist/cli.js --version
node dist/cli.js list
node dist/cli.js add subscription-card --skip-deps

# Or use the linked package
billing-sdk list
billing-sdk add payment-form
```

## Adding New Components

To add a new component to the registry:

1. **Update `src/registry.ts`**:

```typescript
export const billingSDKRegistry: Record<string, ComponentRegistry> = {
  // ... existing components
  "my-new-component": {
    name: "my-new-component",
    description: "Brief description of what this component does",
    category: "subscription", // or payment, invoice, credit, feedback, form, table
    dependencies: ["@stripe/stripe-js"], // npm packages
    registryDependencies: ["card", "button"], // shadcn components
    files: [{ name: "my-new-component.tsx" }],
    meta: {
      source: "https://github.com/autlify/billing-sdk",
      docs: "/site/docs/billing-sdk",
      examples: ["/site/design#billing-sdk"]
    }
  }
}
```

2. **Rebuild the package**:

```bash
bun run build
```

## Release Process

### Pre-release Checklist

- [ ] All tests pass
- [ ] Types are correctly exported
- [ ] CLI commands work as expected
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated

### Version Bump

```bash
# Update version in package.json
# Follow semver: MAJOR.MINOR.PATCH

# Build
bun run build

# Test locally
bun link
cd /path/to/test/project
bun link @autlify/billing-sdk
```

### Publishing (When Ready)

```bash
# Login to npm
npm login

# Publish
npm publish --access public

# Or dry run first
npm publish --dry-run
```

## CLI Architecture

The CLI is built with [Commander.js](https://github.com/tj/commander.js):

### Commands

- **`list`** - Show all available components
  - Option: `--category <category>` - Filter by category
  
- **`add <component>`** - Install a component
  - Option: `--path <path>` - Custom installation directory
  - Option: `--skip-deps` - Skip dependency installation
  
- **`init`** - Initialize billing SDK structure
  - Option: `--path <path>` - Installation directory
  
- **`info <component>`** - Get component details

### How It Works

1. User runs `bunx @autlify/billing-sdk add subscription-card`
2. CLI reads from `src/registry.ts` for component metadata
3. Installs npm dependencies (if not skipped)
4. Installs shadcn/ui dependencies
5. Downloads component files from GitHub
6. Creates necessary directory structure
7. Shows import instructions

## TypeScript Configuration

The package uses a specialized tsconfig that:

- Extends the main project's tsconfig
- Disables `incremental` compilation (required for tsup)
- Targets ES2022 for modern JavaScript
- Includes type paths to main project components
- Enables strict type checking

## Build Configuration (tsup.config.ts)

Two separate builds:

### Library Build
- **Formats**: CommonJS + ESM
- **Outputs**: `dist/index.js`, `dist/index.mjs`, type definitions
- **Features**: Source maps, tree-shaking
- **Externals**: React, Next.js, Radix UI

### CLI Build
- **Format**: CommonJS only
- **Output**: `dist/cli.js` (executable)
- **Features**: Minified, shebang banner
- **Platform**: Node.js 18+

## Troubleshooting

### Build Errors

**"No input files"**
- Ensure `tsup.config.ts` has proper `entry` definitions
- Check that source files exist

**"Duplicate shebang"**
- Remove `#!/usr/bin/env node` from `bin/cli.ts`
- Let tsup add it via `banner.js` config

**TypeScript errors**
- Run `bun run typecheck` to see detailed errors
- Ensure all imports are correctly typed
- Check that tsconfig paths are correct

### CLI Not Working

**"Command not found"**
```bash
# Rebuild and relink
bun run build
bun link
chmod +x dist/cli.js
```

**"Cannot find module"**
- Check import paths in `bin/cli.ts`
- Ensure `src/registry.ts` exports are correct
- Verify build output in `dist/`

## VS Code Integration

Recommended extensions:
- TypeScript and JavaScript Language Features (built-in)
- ESLint
- Prettier

## File Watching

During development, use watch mode:

```bash
bun run dev
```

This rebuilds automatically on file changes.

## Component File Structure

Components should follow this structure:

```typescript
import React from "react"
import { Card } from "@/components/ui/card"

interface MyComponentProps {
  // Props definition
}

export const MyComponent = ({ ...props }: MyComponentProps) => {
  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      {/* Component content */}
    </div>
  )
}
```

## Best Practices

1. **Type Safety**: All components should be fully typed
2. **Consistent Styling**: Use standardized container patterns
3. **Dark Mode**: Support theme-aware colors
4. **Accessibility**: Follow ARIA guidelines
5. **Documentation**: Include JSDoc comments
6. **Testing**: Test in isolation and integration

## Questions?

- Check the [main documentation](https://autlify.com/site/docs/billing-sdk)
- Review [existing components](../../src/components/billing-sdk/)
- See [live examples](https://autlify.com/site/design#billing-sdk)
