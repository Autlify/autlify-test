# Linear Token Migration Guide

## Overview
This design system is based on Linear's exact token structure, providing clean semantic utilities while maintaining the full power of Linear's design language.

## Theme Mapping
- **Light Theme** → Linear Light (default)
- **Dark Theme** → Basic dark mode (minimal usage)
- **Premium Theme** → Linear Dark (primary dark theme) ✨
- **Glass Theme** → Linear Glass (translucent effects) 🪟

## Token Categories

### 1. Background/Surface Colors
Use for backgrounds, cards, surfaces, and containers.

```tsx
// Old (INCORRECT)
className="bg-bg-primary"
className="bg-bg-secondary"

// New (CORRECT)
className="bg-surface-primary"     // Main background
className="bg-surface-secondary"   // Cards, elevated surfaces
className="bg-surface-tertiary"    // Nested cards
className="bg-surface-quaternary"  // Deeper nesting
className="bg-surface-quinary"     // Maximum depth

// Level-based backgrounds (0-3)
className="bg-surface-0"  // Base level
className="bg-surface-1"  // Raised once
className="bg-surface-2"  // Raised twice
className="bg-surface-3"  // Highest level
```

### 2. Text/Content Colors
Use for all text elements, icons, and content.

```tsx
// Old (INCORRECT)
className="text-fg-primary"
className="text-fg-secondary"

// New (CORRECT)
className="text-content-primary"     // Primary text, headings
className="text-content-secondary"   // Secondary text, descriptions
className="text-content-tertiary"    // Tertiary text, captions
className="text-content-quaternary"  // Minimal text, placeholders
```

### 3. Border Colors
Use for all border applications.

```tsx
// Old
className="border-line-primary"

// New - Named borders (explicit token)
className="border-border-primary"     // Primary borders
className="border-border-secondary"   // Subtle borders
className="border-border-tertiary"    // Very subtle borders
className="border-border-translucent" // Glassmorphic borders

// New - Line hierarchy (semantic borders)
className="border-line-primary"       // Strong dividers
className="border-line-secondary"     // Normal dividers
className="border-line-tertiary"      // Subtle dividers
className="border-line-quaternary"    // Very subtle dividers
```

### 4. Brand/Accent Colors
Use for CTAs, links, and branded elements.

```tsx
// Brand colors
className="bg-brand"              // Primary brand color
className="bg-brand-hover"        // Brand hover state
className="bg-brand-tint"         // Brand tint/background
className="text-brand-text"       // Text on brand backgrounds

// Links
className="text-link"             // Link color
className="text-link-hover"       // Link hover color

// Gradients (use in combination)
className="btn-brand-gradient"    // Pre-built gradient button
```

### 5. Shadows
Use Linear's shadow system for depth.

```tsx
className="shadow-linear-tiny"    // Minimal shadow
className="shadow-linear-sm"      // Small shadow
className="shadow-linear-md"      // Medium shadow
className="shadow-linear-lg"      // Large shadow
className="shadow-linear-xl"      // Extra large shadow
```

### 6. Status Colors
Use for feedback, alerts, and status indicators.

```tsx
// Success
className="bg-success text-success-foreground"

// Warning
className="bg-warning-background text-warning border-warning-border"

// Destructive/Error
className="bg-destructive text-destructive-foreground"
```

## Common Migration Patterns

### Card Component
```tsx
// Old
<div className="bg-bg-primary border-line-primary">
  <h2 className="text-fg-primary">Title</h2>
  <p className="text-fg-secondary">Description</p>
</div>

// New
<div className="bg-surface-secondary border-line-secondary">
  <h2 className="text-content-primary">Title</h2>
  <p className="text-content-secondary">Description</p>
</div>
```

### Button Component
```tsx
// Old
<button className="bg-accent-base hover:bg-accent-hover text-white">
  Click me
</button>

// New
<button className="bg-brand hover:bg-brand-hover text-brand-text">
  Click me
</button>

// Or use pre-built gradient
<button className="btn-brand-gradient">
  Click me
</button>
```

### Form Input
```tsx
// Old
<input className="bg-bg-secondary border-line-primary text-fg-primary" />

// New
<input className="bg-surface-secondary border-line-primary text-content-primary" />
```

### Dropdown/Popover
```tsx
// Old
<div className="bg-bg-primary border-line-primary shadow-md">
  <div className="hover:bg-bg-secondary">
    <span className="text-fg-primary">Option</span>
  </div>
</div>

// New
<div className="bg-surface-primary border-line-primary shadow-linear-md">
  <div className="hover:bg-surface-secondary">
    <span className="text-content-primary">Option</span>
  </div>
</div>
```

## Glass Theme Special Effects

When using `.glass` theme class, add these utilities for the glassmorphic effect:

```tsx
<div className="glass bg-surface-secondary border-border-translucent">
  {/* Content with blur backdrop */}
</div>
```

The `.glass` utility class automatically applies:
- `backdrop-filter: blur(20px)`
- `backdrop-saturate: 150%)`

## Shadcn/UI Compatibility

All existing Shadcn/UI components continue to work as-is. These tokens are still available:

- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-popover`, `text-popover-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `border`, `input`, `ring`

These map intelligently to Linear tokens underneath.

## Quick Reference Table

| Use Case | Old Class | New Class |
|----------|-----------|-----------|
| Page background | `bg-bg-primary` | `bg-surface-primary` |
| Card background | `bg-bg-secondary` | `bg-surface-secondary` |
| Nested card | `bg-bg-tertiary` | `bg-surface-tertiary` |
| Primary text | `text-fg-primary` | `text-content-primary` |
| Secondary text | `text-fg-secondary` | `text-content-secondary` |
| Muted text | `text-fg-tertiary` | `text-content-tertiary` |
| Border | `border-line-primary` | `border-line-primary` ✓ (same) |
| Divider | `border-line-secondary` | `border-line-secondary` ✓ (same) |
| Brand button | `bg-accent-base` | `bg-brand` |
| Brand hover | `hover:bg-accent-hover` | `hover:bg-brand-hover` |
| Link | N/A | `text-link` |
| Shadow | `shadow-md` | `shadow-linear-md` |

## Implementation Strategy

1. **Start with new components** - Use Linear tokens from the beginning
2. **Migrate incrementally** - Update existing components one at a time
3. **Test per theme** - Verify colors in Light, Premium, and Glass themes
4. **Use search/replace** - Bulk update common patterns:
   - `bg-bg-` → `bg-surface-`
   - `text-fg-` → `text-content-`
   - `bg-accent-base` → `bg-brand`

## CSS Variables Reference

All Linear tokens are available as CSS variables if needed:

```css
/* Background/Surface */
var(--color-bg-primary)
var(--color-bg-secondary)
/* ... */

/* Text/Content */
var(--color-text-primary)
var(--color-text-secondary)
/* ... */

/* Borders/Lines */
var(--color-border-primary)
var(--color-line-primary)
/* ... */

/* Brand/Accent */
var(--color-accent)
var(--color-brand-bg)
var(--color-brand-gradient)
/* ... */

/* Shadows */
var(--shadow-tiny)
var(--shadow-sm)
/* ... */
```

## Notes

- All colors automatically adapt across themes
- Premium theme = Linear's dark theme (most polished dark experience)
- Glass theme provides translucent backgrounds with backdrop blur
- No need to specify different colors per theme - the system handles it
- Use semantic names (surface, content, line) not implementation details (bg, fg)
