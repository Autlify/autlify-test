# Semantic Color Scale System

## The Problem We Solved

**Before**: Colors needed manual theme variants for readability
```tsx
<p className="text-red-700 dark:text-red-300 premium:text-red-400">Error</p>
<span className="text-blue-600 dark:text-blue-400 premium:text-blue-400">Info</span>
```

**After**: Semantic scales automatically pick the right shade
```tsx
<p className="text-red-semantic-1">Error</p>
<span className="text-blue-semantic-2">Info</span>
```

## How It Works

The semantic color system uses **numbered levels (1-5)** that automatically map to different shades based on the active theme:

- **Level 1**: Most prominent/readable (highest contrast)
- **Level 2**: Strong emphasis
- **Level 3**: Medium emphasis (neutral)
- **Level 4**: Subtle emphasis
- **Level 5**: Most subtle (lowest contrast)

## Color Mappings by Theme

### Light Theme (Dark text on light background)
| Semantic Level | Maps To | Use Case |
|---------------|---------|----------|
| `text-red-semantic-1` | `text-red-700` | Error messages, critical alerts |
| `text-red-semantic-2` | `text-red-600` | Warning indicators |
| `text-red-semantic-3` | `text-red-500` | Standard red accents |
| `text-red-semantic-4` | `text-red-400` | Subtle highlights |
| `text-red-semantic-5` | `text-red-300` | Very subtle tints |

### Dark Theme (Light text on dark background)
| Semantic Level | Maps To | Use Case |
|---------------|---------|----------|
| `text-red-semantic-1` | `text-red-300` | Error messages, critical alerts |
| `text-red-semantic-2` | `text-red-400` | Warning indicators |
| `text-red-semantic-3` | `text-red-500` | Standard red accents |
| `text-red-semantic-4` | `text-red-600` | Subtle highlights |
| `text-red-semantic-5` | `text-red-700` | Very subtle tints |

### Premium Theme (Light text on very dark background)
| Semantic Level | Maps To | Use Case |
|---------------|---------|----------|
| `text-red-semantic-1` | `text-red-400` | Error messages (brighter for contrast) |
| `text-red-semantic-2` | `text-red-500` | Warning indicators |
| `text-red-semantic-3` | `text-red-600` | Standard red accents |
| `text-red-semantic-4` | `text-red-700` | Subtle highlights |
| `text-red-semantic-5` | `text-red-800` | Very subtle tints |

## Available Color Scales

The system supports these color families:
- `red-semantic-[1-5]` - Errors, danger, critical states
- `blue-semantic-[1-5]` - Information, links, primary actions
- `green-semantic-[1-5]` - Success, confirmation, positive states
- `amber-semantic-[1-5]` - Warnings, caution, attention needed
- `zinc-semantic-[1-5]` - Neutral grays for text/UI elements

## Usage Examples

### Error States
```tsx
// Critical error - highest contrast
<p className="text-red-semantic-1 font-semibold">
  Payment failed - please try again
</p>

// Error hint - medium contrast
<span className="text-red-semantic-3 text-sm">
  Invalid email format
</span>

// Subtle error indicator
<div className="border border-red-semantic-4 bg-red-semantic-5/10">
```

### Success Messages
```tsx
// Strong success message
<div className="bg-green-semantic-1/10 text-green-semantic-1 p-4 rounded-lg">
  ✓ Changes saved successfully
</div>

// Subtle success indicator
<CheckIcon className="text-green-semantic-3" />
```

### Information & Links
```tsx
// Primary link - most readable
<a href="/docs" className="text-blue-semantic-1 hover:text-blue-semantic-2">
  Learn more
</a>

// Secondary info text
<p className="text-blue-semantic-3">
  Last updated 2 hours ago
</p>

// Subtle info badge
<span className="bg-blue-semantic-5/20 text-blue-semantic-2 px-2 py-1 rounded">
  New
</span>
```

### Warning States
```tsx
// High priority warning
<div className="bg-amber-semantic-1/10 border-l-4 border-amber-semantic-1 p-4">
  <p className="text-amber-semantic-1 font-medium">
    Action required
  </p>
  <p className="text-amber-semantic-3">
    Your subscription expires in 3 days
  </p>
</div>
```

### Neutral Text Hierarchy
```tsx
// Primary heading
<h2 className="text-zinc-semantic-1 font-bold">
  Account Settings
</h2>

// Secondary text
<p className="text-zinc-semantic-2">
  Manage your account preferences
</p>

// Tertiary/helper text
<span className="text-zinc-semantic-4 text-sm">
  Last login: Jan 20, 2026
</span>
```

## Real-World Component Example

### Alert Component
```tsx
function Alert({ variant = 'info', title, children }) {
  const colors = {
    error: {
      bg: 'bg-red-semantic-5/10',
      border: 'border-red-semantic-3',
      title: 'text-red-semantic-1',
      text: 'text-red-semantic-2'
    },
    warning: {
      bg: 'bg-amber-semantic-5/10',
      border: 'border-amber-semantic-3',
      title: 'text-amber-semantic-1',
      text: 'text-amber-semantic-2'
    },
    success: {
      bg: 'bg-green-semantic-5/10',
      border: 'border-green-semantic-3',
      title: 'text-green-semantic-1',
      text: 'text-green-semantic-2'
    },
    info: {
      bg: 'bg-blue-semantic-5/10',
      border: 'border-blue-semantic-3',
      title: 'text-blue-semantic-1',
      text: 'text-blue-semantic-2'
    }
  }

  const c = colors[variant]
  
  return (
    <div className={`${c.bg} border-l-4 ${c.border} p-4 rounded-lg`}>
      {title && <h4 className={`${c.title} font-semibold mb-1`}>{title}</h4>}
      <p className={c.text}>{children}</p>
    </div>
  )
}

// Usage - works in all 3 themes!
<Alert variant="error" title="Payment Failed">
  Your credit card was declined. Please update your payment method.
</Alert>
```

## Comparison: Before vs After

### ❌ Before (Manual Variants)
```tsx
<div className="bg-red-50 dark:bg-red-950/20 premium:bg-red-950/30 border border-red-200 dark:border-red-800 premium:border-red-800 p-4">
  <h3 className="text-red-900 dark:text-red-200 premium:text-red-300 font-semibold">
    Error
  </h3>
  <p className="text-red-700 dark:text-red-400 premium:text-red-400 text-sm">
    Something went wrong
  </p>
</div>
```

### ✅ After (Semantic Scales)
```tsx
<div className="bg-red-semantic-5/10 border border-red-semantic-3 p-4">
  <h3 className="text-red-semantic-1 font-semibold">
    Error
  </h3>
  <p className="text-red-semantic-2 text-sm">
    Something went wrong
  </p>
</div>
```

## Background Color Usage

For backgrounds with opacity/alpha:

```tsx
// Light tint backgrounds
<div className="bg-blue-semantic-5/10">  {/* 10% opacity of level 5 */}
<div className="bg-green-semantic-4/20"> {/* 20% opacity of level 4 */}

// Solid backgrounds (use carefully - ensure text contrast)
<div className="bg-red-semantic-1 text-white">
```

## Best Practices

### ✅ DO
- Use semantic-1 for critical/most important elements
- Use semantic-2 for strong emphasis
- Use semantic-3 as the default/neutral state
- Use semantic-4 and semantic-5 for subtle/secondary elements
- Combine with opacity for backgrounds: `bg-red-semantic-5/10`

### ❌ DON'T
- Mix semantic and hardcoded scales: `text-red-semantic-1 hover:text-red-600` ❌
- Skip levels dramatically: going from semantic-1 to semantic-5 directly
- Use dark shades (semantic-1) on dark backgrounds - the system handles this!

## Extending the System

To add more color families, edit `globals.css`:

```css
@layer base {
  :root {
    /* Light theme */
    --purple-1: var(--color-purple-700);
    --purple-2: var(--color-purple-600);
    --purple-3: var(--color-purple-500);
    --purple-4: var(--color-purple-400);
    --purple-5: var(--color-purple-300);
  }
  
  .dark {
    /* Dark theme */
    --purple-1: var(--color-purple-300);
    --purple-2: var(--color-purple-400);
    --purple-3: var(--color-purple-500);
    --purple-4: var(--color-purple-600);
    --purple-5: var(--color-purple-700);
  }
  
  .premium {
    /* Premium theme */
    --purple-1: var(--color-purple-400);
    --purple-2: var(--color-purple-500);
    --purple-3: var(--color-purple-600);
    --purple-4: var(--color-purple-700);
    --purple-5: var(--color-purple-800);
  }
}

@theme inline {
  --color-purple-semantic-1: var(--purple-1);
  --color-purple-semantic-2: var(--purple-2);
  --color-purple-semantic-3: var(--purple-3);
  --color-purple-semantic-4: var(--purple-4);
  --color-purple-semantic-5: var(--purple-5);
}
```

## Benefits

1. ✅ **Write once, works everywhere** - No more theme variants
2. ✅ **Always readable** - Automatic contrast optimization per theme
3. ✅ **Consistent hierarchy** - Semantic numbers indicate importance
4. ✅ **Maintainable** - Change mappings in one place
5. ✅ **Type-safe** - Full Tailwind autocomplete support
6. ✅ **Predictable** - Same semantic level = same visual weight across colors

## Migration Strategy

1. **Start with new components** - Use semantic scales from the beginning
2. **Gradually update existing code** - Replace variant-heavy classes
3. **Test in all themes** - Verify readability and contrast
4. **Document your usage** - Help team understand the system

## Summary

The semantic color scale system eliminates the need for manual `dark:` and `premium:` variants by automatically selecting the appropriate shade for each theme. This results in cleaner code, better maintainability, and guaranteed readability across all themes.

**Key Takeaway**: Use `text-[color]-semantic-[1-5]` where 1 is most prominent and 5 is most subtle. The system handles the rest! 🎨
