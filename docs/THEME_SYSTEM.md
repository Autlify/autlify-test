# Standardized Theme System

## Overview
Our theme system now uses **standardized semantic tokens** that work automatically across all three themes (Light, Dark, Premium) without needing `dark:` or `premium:` variants.

## Architecture

### 1. Core Semantic Tokens (All 3 Themes)
These tokens are defined in `globals.css` and automatically adapt:

```css
/* Available in :root, .dark, and .premium */
--background        /* Main page background */
--foreground        /* Primary text color */
--card              /* Card/panel surface */
--primary           /* Brand color (blue #006eff) */
--secondary         /* Secondary actions */
--muted             /* Muted backgrounds */
--muted-foreground  /* Muted text */
--border            /* Default borders */
--input             /* Input borders */
```

### 2. Extended Tokens (For Rich Designs)
Additional tokens for sophisticated UI:

```css
--surface           /* Elevated surfaces (modals, dropdowns) */
--surface-hover     /* Hover state for surfaces */
--text-secondary    /* Less prominent text */
--text-tertiary     /* Hints, captions, disabled text */
--border-strong     /* Emphasized borders */
--divider           /* Subtle dividers/separators */
```

### 3. Smart Color Mappings
Use these semantic class names that auto-adapt to themes:

| Class | Purpose | Light Value | Dark Value | Premium Value |
|-------|---------|-------------|------------|---------------|
| `bg-ui-base` | Page background | Light gray | Dark blue-gray | Near black |
| `bg-ui-1` | Elevated surface | White | Darker blue | Dark gray |
| `bg-ui-2` | Cards/panels | White | Dark blue | Medium dark |
| `bg-ui-hover` | Hover states | Light blue tint | Lighter blue | Lighter gray |
| `text-content-primary` | Main text | Near black | White | Off-white |
| `text-content-secondary` | Secondary text | Gray | Light gray | Medium gray |
| `text-content-tertiary` | Hints/captions | Lighter gray | Gray | Darker gray |
| `border-subtle` | Light borders | Light gray | Dark gray | Very dark |
| `border-strong` | Emphasized | Medium gray | Lighter gray | Darker gray |

## Usage Examples

### ❌ Old Way (Manual Variants)
```tsx
<div className="bg-white dark:bg-slate-900 premium:bg-[#08090a]">
  <h1 className="text-gray-900 dark:text-white premium:text-[#f7f8f8]">Title</h1>
  <p className="text-gray-600 dark:text-gray-400 premium:text-[#8a8f98]">Description</p>
</div>
```

### ✅ New Way (Semantic Tokens)
```tsx
<div className="bg-background">
  <h1 className="text-foreground">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Advanced Example: Card Component
```tsx
<Card className="bg-card border-border hover:bg-surface-hover">
  <CardHeader>
    <CardTitle className="text-foreground">Premium Feature</CardTitle>
    <CardDescription className="text-content-secondary">
      Secondary information text
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="rounded-lg bg-ui-1 border border-border-subtle p-4">
      <p className="text-content-primary">Primary content</p>
      <span className="text-content-tertiary">Helper text</span>
    </div>
    <Separator className="bg-border-divider" />
  </CardContent>
</Card>
```

## Theme Values Reference

### Light Theme
- Background: Very light blue-tinted white
- Foreground: Near black
- Surfaces: Pure white
- Text hierarchy: Black → Gray (60%) → Light gray (45%)
- Borders: Light gray (90%)

### Dark Theme
- Background: Very dark blue-gray
- Foreground: Off-white
- Surfaces: Dark blue-gray
- Text hierarchy: White → Light gray (70%) → Gray (54%)
- Borders: Medium dark gray

### Premium (Linear-inspired)
- Background: Near black (#08090a)
- Foreground: Off-white (#f7f8f8)
- Surfaces: Dark gray (#1c1c1f)
- Text hierarchy: Off-white → Light gray (70%) → Medium gray (56%)
- Borders: Very dark gray (#23252a)
- Accent: Bright blue (#006eff)

## Migration Guide

### Step 1: Replace Hardcoded Colors
```tsx
// Before
<div className="bg-white dark:bg-black">

// After
<div className="bg-background">
```

### Step 2: Use Semantic Text Colors
```tsx
// Before
<p className="text-gray-600 dark:text-gray-400">

// After
<p className="text-muted-foreground">
```

### Step 3: Borders & Surfaces
```tsx
// Before
<div className="border border-gray-200 dark:border-gray-800">

// After
<div className="border border-border">
```

### Step 4: Interactive States
```tsx
// Before
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">

// After
<button className="bg-muted hover:bg-surface-hover">
```

## Benefits

1. **✅ No More Variants**: Write once, works in all themes
2. **✅ Maintainable**: Change theme colors in one place
3. **✅ Consistent**: Semantic naming ensures design coherence
4. **✅ Scalable**: Easy to add new themes or adjust existing ones
5. **✅ Type-safe**: Tailwind autocomplete works for all tokens

## Custom Extensions

If you need theme-specific styling that doesn't fit semantic tokens:

```tsx
// Still acceptable for unique cases
<div className="premium:shadow-[0_8px_30px_rgba(0,110,255,0.3)]">
```

But try to use semantic tokens first:
```tsx
// Preferred - define in theme
<div className="shadow-lg">  {/* Adapts per theme */}
```

## Next Steps

1. Gradually migrate existing components to use semantic tokens
2. Remove redundant `dark:` and `premium:` variants where possible
3. Add more semantic mappings in `@theme` block as needed
4. Keep the Linear aesthetic intact while improving maintainability
