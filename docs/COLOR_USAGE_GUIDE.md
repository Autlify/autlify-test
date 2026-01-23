# Color Usage Guide

## Design Philosophy: Brand vs Standard Colors

This guide establishes clear rules for when to use **brand colors** (Linear blue #2E8CFF) versus **standard theme colors** (neutrals, primary surfaces) to create visual hierarchy and avoid color overuse.

---

## 🎨 Color Categories

### 1. Brand Color (Blue #2E8CFF)
**Purpose:** Special emphasis, primary CTAs, interactive highlights  
**CSS Variable:** `--accent-base` (hsl(213, 100%, 59%))

**Use ONLY for:**
- Primary call-to-action buttons
- Links and interactive elements  
- Hover states and focus rings
- Brand-specific highlights (logos, special badges)
- Accent elements that need maximum attention

**Utility Classes:**
```css
/* Backgrounds */
.btn-brand               /* Primary CTA button with gradient */
.bg-accent-base          /* Solid brand background */
.bg-accent-tint          /* Light brand tint */

/* Text */
.text-brand-gradient     /* Gradient text with brand colors */
.text-accent-base        /* Solid brand text */

/* Borders */
.brand-border-gradient   /* Animated gradient border */
.border-accent-base      /* Solid brand border */
```

**Examples:**
```tsx
// ✅ CORRECT - Brand color for primary CTA
<Link href="/signup" className="btn-brand">
  Get Started
</Link>

// ✅ CORRECT - Brand gradient for emphasis
<h1 className="text-brand-gradient">
  Purpose-built tool
</h1>

// ❌ WRONG - Don't use for all buttons
<button className="btn-brand">Cancel</button>  // Use btn-secondary instead
```

---

### 2. Standard Primary (#e8e8e8 in light mode)
**Purpose:** General surfaces, neutral backgrounds  
**CSS Variable:** `--primary`

**Use for:**
- General background surfaces
- Neutral card backgrounds
- Non-interactive elements
- Standard containers

**Utility Classes:**
```css
.bg-primary              /* Standard surface background */
.border-primary          /* Standard border */
```

**Note:** In the Premium/Linear theme, avoid using `--primary` for text or CTAs. It's reserved for surfaces.

---

### 3. Foreground Hierarchy
**Purpose:** Text content with semantic hierarchy  
**CSS Variables:** `--fg-primary`, `--fg-secondary`, `--fg-tertiary`, `--fg-quaternary`

**Use for:**
- All body text and headings (non-branded)
- Secondary information
- Placeholder text
- Disabled states

**Utility Classes:**
```css
.text-fg-primary         /* Main content text */
.text-fg-secondary       /* Supporting text */
.text-fg-tertiary        /* Metadata, captions */
.text-fg-quaternary      /* Subtle hints */
```

**Hierarchy Example:**
```tsx
{/* Primary heading - use foreground, not brand */}
<h2 className="text-fg-primary font-semibold">
  Features Overview
</h2>

{/* Supporting text */}
<p className="text-fg-secondary">
  Explore our comprehensive feature set
</p>

{/* Metadata */}
<span className="text-fg-tertiary text-sm">
  Updated 2 hours ago
</span>
```

---

### 4. Background Hierarchy
**Purpose:** Layered backgrounds for depth  
**CSS Variables:** `--bg-primary` through `--bg-quaternary`

**Use for:**
- Page backgrounds (primary)
- Card surfaces (secondary)
- Nested components (tertiary)
- Input fields (quaternary)

**Utility Classes:**
```css
.bg-bg-primary           /* Base page background */
.bg-bg-secondary         /* Card/panel backgrounds */
.bg-bg-tertiary          /* Nested sections */
.bg-bg-quaternary        /* Input fields, deeper nesting */
```

**Layering Example:**
```tsx
<div className="bg-bg-primary">          {/* Page */}
  <div className="bg-bg-secondary">      {/* Card */}
    <div className="bg-bg-tertiary">     {/* Section */}
      <input className="bg-bg-quaternary" /> {/* Input */}
    </div>
  </div>
</div>
```

---

### 5. Accent Colors (Hover States)
**Purpose:** Interactive feedback  
**CSS Variables:** `--accent-tint`, `--accent-hover`

**Use for:**
- Border hover states
- Subtle interactive highlights
- Focus indicators (non-primary)

**Utility Classes:**
```css
.border-accent-tint      /* Light accent border */
.bg-accent-hover         /* Hover background */
```

---

## 🎯 Decision Tree: Which Color to Use?

```
Is this element a PRIMARY call-to-action?
├─ YES → Use .btn-brand or .text-brand-gradient
└─ NO
   └─ Is this element INTERACTIVE (hover/click)?
      ├─ YES → Use standard colors with .border-accent-tint on hover
      └─ NO
         └─ Is this TEXT content?
            ├─ YES → Use .text-fg-primary / .text-fg-secondary / .text-fg-tertiary
            └─ NO → Use .bg-bg-secondary / .bg-bg-tertiary for surfaces
```

---

## 📋 Component Patterns

### Buttons

```tsx
// Primary CTA - use brand gradient
<button className="btn-brand">
  Sign Up Now
</button>

// Secondary action - use standard colors
<button className="btn-secondary">
  Learn More
</button>

// Ghost/tertiary action - minimal styling
<button className="btn-ghost">
  Cancel
</button>
```

### Cards

```tsx
// Standard card - neutral background
<Card className="bg-bg-secondary border-line-secondary hover:border-accent-tint">
  {/* Content */}
</Card>

// Popular/featured card - brand accent
<Card className="brand-border-gradient glass backdrop-blur-xl">
  {/* Special content */}
</Card>
```

### Headings

```tsx
// Standard heading - foreground color
<h1 className="text-fg-primary font-bold">
  Dashboard
</h1>

// Hero heading with brand emphasis - selective gradient
<h1 className="text-fg-primary">
  Meet the <span className="text-brand-gradient">purpose-built</span> system
</h1>
```

### Links

```tsx
// Interactive link - brand color
<a href="#" className="text-accent-base hover:text-accent-hover">
  Learn more →
</a>

// Breadcrumb/nav link - standard foreground
<a href="#" className="text-fg-tertiary hover:text-fg-primary">
  Home / Products
</a>
```

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Use brand blue everywhere
```tsx
// WRONG - overuses brand color
<div className="bg-accent-base">
  <h1 className="text-brand-gradient">Title</h1>
  <p className="text-accent-base">Description</p>
  <button className="btn-brand">Click</button>
  <button className="btn-brand">Cancel</button>  {/* Should be secondary */}
</div>
```

### ✅ DO: Use brand color strategically
```tsx
// CORRECT - brand color for primary CTA only
<div className="bg-bg-secondary">
  <h1 className="text-fg-primary">Title</h1>
  <p className="text-fg-secondary">Description</p>
  <button className="btn-brand">Sign Up</button>
  <button className="btn-secondary">Cancel</button>
</div>
```

---

### ❌ DON'T: Mix old primary with brand colors
```tsx
// WRONG - mixes --primary with blue-600
<h1 className="bg-gradient-to-r from-primary via-blue-600 to-primary">
  Heading
</h1>
```

### ✅ DO: Use consistent brand gradient utility
```tsx
// CORRECT - uses dedicated utility class
<h1 className="text-brand-gradient">
  Heading
</h1>
```

---

### ❌ DON'T: Use border-primary for accent borders
```tsx
// WRONG - primary is for neutral surfaces
<div className="border-primary">...</div>
```

### ✅ DO: Use semantic border utilities
```tsx
// CORRECT - semantic naming
<div className="border-line-secondary">...</div>  {/* Neutral */}
<div className="border-accent-tint">...</div>     {/* Interactive */}
```

---

## 📚 Summary: Quick Reference

| Element Type | Utility Class | Color Variable |
|-------------|---------------|----------------|
| Primary CTA | `.btn-brand` | `--accent-base` |
| Secondary Button | `.btn-secondary` | `--bg-tertiary` |
| Body Text | `.text-fg-primary` | `--fg-primary` |
| Supporting Text | `.text-fg-secondary` | `--fg-secondary` |
| Page Background | `.bg-bg-primary` | `--bg-primary` |
| Card Surface | `.bg-bg-secondary` | `--bg-secondary` |
| Neutral Border | `.border-line-secondary` | `--line-secondary` |
| Interactive Border | `.border-accent-tint` | `--accent-tint` |
| Brand Gradient Text | `.text-brand-gradient` | N/A (gradient) |
| Brand Gradient Border | `.brand-border-gradient` | N/A (animated gradient) |

---

## 🎨 Theme-Aware Usage

All utilities automatically adapt to theme (light/dark/premium/glass):

```tsx
// No need for dark: prefixes - utilities handle it
<div className="bg-bg-secondary text-fg-primary border-line-secondary">
  Automatically adapts to light/dark/premium themes
</div>
```

---

## 🔍 When to Use Each Pattern

### Navigation
- **Logo area**: Brand color accent (subtle)
- **Nav links**: Standard foreground with hover accent
- **Login/CTA button**: Brand gradient (`.btn-brand`)

### Cards
- **Standard cards**: Neutral backgrounds (`.bg-bg-secondary`)
- **Popular/featured cards**: Brand border gradient + glass effect
- **Hover states**: Accent border (`.border-accent-tint`)

### Forms
- **Input fields**: Neutral backgrounds (`.bg-bg-quaternary`)
- **Labels**: Standard foreground (`.text-fg-primary`)
- **Submit button**: Brand gradient (`.btn-brand`)
- **Cancel/reset**: Secondary button (`.btn-secondary`)

### Hero Sections
- **Main heading**: Foreground color with selective brand gradient on key phrase
- **Subheading**: Secondary foreground (`.text-fg-secondary`)
- **Primary CTA**: Brand gradient button
- **Secondary CTA**: Secondary button

---

## ✅ Implementation Checklist

When adding new components:

1. ⬜ Is there a primary CTA? → Use `.btn-brand`
2. ⬜ Are there secondary actions? → Use `.btn-secondary`
3. ⬜ Does the heading need emphasis? → Use `.text-brand-gradient` sparingly
4. ⬜ Is this a neutral surface? → Use `.bg-bg-secondary` or `.bg-bg-tertiary`
5. ⬜ Does this need to stand out? → Use `.brand-border-gradient` + `.glass`
6. ⬜ Is this standard text? → Use `.text-fg-primary` / `.text-fg-secondary`
7. ⬜ Are there interactive elements? → Use `.border-accent-tint` on hover

---

## 📖 Related Documentation

- [THEME_SYSTEM.md](./THEME_SYSTEM.md) - Complete theme architecture
- [SEMANTIC_COLORS_GUIDE.md](./SEMANTIC_COLORS_GUIDE.md) - Semantic color tokens
- [PREMIUM_THEME_GUIDE.md](./PREMIUM_THEME_GUIDE.md) - Premium/Linear theme details

---

**Last Updated:** January 2024  
**Version:** 2.0 - Post-consolidation with brand color discipline
