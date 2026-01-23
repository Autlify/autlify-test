# Premium Theme Implementation - Comprehensive TODO List

## Overview
Complete the `.premium` theme with Linear-inspired design system, focusing on brand color integration, semantic token exports, utility classes, and accessibility compliance.

---

## Phase 1: Semantic Token Audit & Fixes 🔍

### 1.1 Missing Token Exports (HIGH PRIORITY)
- [ ] **Export mask-* tokens to @theme inline**
  - [ ] Add `--color-mask-*` variants for backdrop/overlay effects
  - [ ] Define mask opacity levels (subtle, medium, heavy)
  - [ ] Ensure premium theme has translucent mask support
  
- [ ] **Export brand-* tokens to @theme inline**
  - [ ] Add `--color-brand-bg: hsl(var(--brand-bg))`
  - [ ] Add `--color-brand-text: hsl(var(--brand-text))`
  - [ ] Add `--color-brand-hover` token (currently missing)
  - [ ] Add `--color-brand-active` token (currently missing)
  - [ ] Add `--color-brand-border` token (currently missing)
  
- [ ] **Export button-brand-* tokens to @theme inline**
  - [ ] Add `--color-button-brand-bg`
  - [ ] Add `--color-button-brand-bg-hover`
  - [ ] Add `--color-button-brand-bg-active`
  - [ ] Add `--color-button-brand-border`
  - [ ] Add `--color-button-brand-text`
  - [ ] Add gradient variants for brand buttons

### 1.2 Fix Duplicate/Conflicting Tokens
- [ ] **Review .premium theme button tokens**
  - ⚠️ Currently has TWO sets of button-primary-* definitions (lines differ)
  - [ ] Consolidate to single source of truth
  - [ ] Decide: Use Linear blue (#006eff) or keep existing purple?
  - [ ] Remove duplicate definitions at bottom of .premium block

- [ ] **Verify --primary token usage in .premium**
  - Current value: `oklch(0.9819 0.0031 253.2500)` (nearly white)
  - [ ] Should this be brand blue instead?
  - [ ] Or is this intentional for dark theme contrast?
  - [ ] Update or document decision

### 1.3 Add Missing Semantic Tokens
- [ ] **Navigation/Menu tokens**
  - [ ] `--nav-bg` - Navigation background
  - [ ] `--nav-border` - Navigation border
  - [ ] `--nav-item-hover` - Menu item hover state
  - [ ] `--nav-item-active` - Active menu item
  
- [ ] **Interactive State tokens**
  - [ ] `--hover-overlay` - Universal hover overlay color
  - [ ] `--active-overlay` - Universal active overlay color
  - [ ] `--focus-ring` - Universal focus ring (currently --ring)
  - [ ] `--disabled-opacity` - Standard disabled opacity value

- [ ] **Surface/Elevation tokens**
  - [ ] `--surface-raised` - Raised surface elevation
  - [ ] `--surface-overlay` - Overlay surface
  - [ ] `--surface-dialog` - Dialog/modal surface
  - [ ] `--surface-tooltip` - Tooltip surface

---

## Phase 2: Button Utility Class Fixes 🔧

### 2.1 Fix Current btn-primary Implementation
- [ ] **Verify gradient background fallback**
  ```css
  /* Current: */
  background-color: hsl(var(--button-primary-bg)); /* fallback */
  background-image: var(--button-primary-bg-gradient);
  
  /* Issue: Gradient may not render if token undefined */
  ```
  - [ ] Add fallback check in .premium theme
  - [ ] Test gradient rendering in production build
  - [ ] Add CSS custom property validation

- [ ] **Fix disabled state opacity stacking**
  ```css
  /* Current: */
  opacity: 0.9; /* on disabled state */
  
  /* Issue: Stacks with color alpha channels */
  ```
  - [ ] Remove opacity OR remove alpha from bg colors
  - [ ] Choose one approach for consistency
  - [ ] Document disabled state strategy

- [ ] **Add missing active gradient**
  - Currently uses `var(--button-primary-bg-gradient-active, fallback)`
  - [ ] Define `--button-primary-bg-gradient-active` in all themes
  - [ ] Or remove this reference and use hover gradient

### 2.2 Add btn-secondary Utility
- [ ] **Create @utility btn-secondary**
  - [ ] Copy btn-primary structure
  - [ ] Replace with `--button-secondary-*` tokens
  - [ ] Remove box-shadow (secondary should be subtle)
  - [ ] Adjust hover lift (smaller scale: 1.01 instead of 1.03)
  - [ ] Test in light/dark/premium themes

### 2.3 Add btn-brand Utility (NEW)
- [ ] **Create @utility btn-brand**
  - [ ] Use new `--button-brand-*` tokens
  - [ ] Implement brand gradient background
  - [ ] Add strong hover effect (scale: 1.05)
  - [ ] Include box-shadow: `var(--shadow-xl)`
  - [ ] Add subtle border glow on hover

### 2.4 Add btn-ghost Utility
- [ ] **Create @utility btn-ghost**
  - [ ] Transparent background
  - [ ] Use `--fg-primary` for text
  - [ ] Hover: `bg-bg-quinary` (subtle fill)
  - [ ] No border or minimal border
  - [ ] Subtle scale hover (1.02)

### 2.5 Add btn-outline Utility
- [ ] **Create @utility btn-outline**
  - [ ] Transparent background
  - [ ] Border: `2px solid hsl(var(--border-primary))`
  - [ ] Text: `hsl(var(--fg-primary))`
  - [ ] Hover: fill with `bg-bg-secondary`
  - [ ] Hover border: accent color

### 2.6 Add Button Size Variants
- [ ] **Create @utility btn-sm**
  - [ ] Padding: `0.375rem 0.75rem`
  - [ ] Font size: `0.875rem`
  - [ ] Gap: `0.375rem`
  
- [ ] **Create @utility btn-lg**
  - [ ] Padding: `0.75rem 1.5rem`
  - [ ] Font size: `1rem`
  - [ ] Gap: `0.625rem`
  
- [ ] **Create @utility btn-icon**
  - [ ] Square dimensions: `2.5rem`
  - [ ] Padding: `0.5rem`
  - [ ] Flex center content

---

## Phase 3: Component Utility Classes 🎨

### 3.1 Card Utilities
- [ ] **Create @utility card-base**
  - [ ] `background: hsl(var(--card))`
  - [ ] `color: hsl(var(--card-foreground))`
  - [ ] `border: 1px solid hsl(var(--border))`
  - [ ] `border-radius: var(--radius)`
  - [ ] `box-shadow: var(--shadow-sm)`

- [ ] **Create @utility card-elevated**
  - [ ] Extends card-base
  - [ ] `box-shadow: var(--shadow-md)`
  - [ ] Hover: `transform: translateY(-2px)`
  - [ ] Hover: `box-shadow: var(--shadow-lg)`

- [ ] **Create @utility card-interactive**
  - [ ] Extends card-elevated
  - [ ] Add cursor pointer
  - [ ] Hover: `border-color: hsl(var(--accent-base))`
  - [ ] Hover: `background: hsl(var(--bg-tertiary))`
  - [ ] Active: scale(0.99)

### 3.2 Input/Field Utilities
- [ ] **Create @utility input-base**
  - [ ] Use existing `.field` as template
  - [ ] Ensure consistent with shadcn Input
  - [ ] Add focus-visible ring
  
- [ ] **Create @utility input-error**
  - [ ] Border: red semantic color
  - [ ] Focus ring: red accent
  - [ ] Background tint: subtle red

- [ ] **Create @utility input-success**
  - [ ] Border: green semantic color
  - [ ] Icon slot: checkmark green
  - [ ] Subtle green background tint

### 3.3 Badge Utilities
- [ ] **Enhance existing badge classes**
  - [ ] `badge-info` - Blue semantic
  - [ ] `badge-success` - Green semantic
  - [ ] `badge-warning` - Amber semantic
  - [ ] `badge-error` - Red semantic
  
- [ ] **Add badge-interactive**
  - [ ] Cursor pointer
  - [ ] Hover: slight scale
  - [ ] Ripple effect on click (optional)

### 3.4 Link/Navigation Utilities
- [ ] **Create @utility link-primary**
  - [ ] Color: `hsl(var(--accent-base))`
  - [ ] Underline offset: 2px
  - [ ] Hover: `color: hsl(var(--accent-hover))`
  
- [ ] **Create @utility link-subtle**
  - [ ] Color: `hsl(var(--fg-secondary))`
  - [ ] No underline
  - [ ] Hover: underline + `fg-primary`

- [ ] **Create @utility nav-item**
  - [ ] Use existing `.nav-link` as base
  - [ ] Add active state variant
  - [ ] Add focus-visible ring

### 3.5 Surface/Container Utilities
- [ ] **Create @utility surface-primary**
  - [ ] `background: hsl(var(--bg-primary))`
  - [ ] Use for main canvas
  
- [ ] **Create @utility surface-secondary**
  - [ ] `background: hsl(var(--bg-secondary))`
  - [ ] Use for panels/sections
  
- [ ] **Create @utility surface-elevated**
  - [ ] `background: hsl(var(--bg-tertiary))`
  - [ ] `box-shadow: var(--shadow-md)`
  - [ ] Use for cards/modals

### 3.6 Text Utilities
- [ ] **Create @utility text-primary**
  - [ ] `color: hsl(var(--fg-primary))`
  
- [ ] **Create @utility text-secondary**
  - [ ] `color: hsl(var(--fg-secondary))`
  
- [ ] **Create @utility text-tertiary**
  - [ ] `color: hsl(var(--fg-tertiary))`
  
- [ ] **Create @utility text-muted**
  - [ ] `color: hsl(var(--fg-quaternary))`
  
- [ ] **Create @utility text-brand**
  - [ ] `color: hsl(var(--accent-base))`

### 3.7 Border Utilities
- [ ] **Create @utility border-primary**
  - [ ] `border-color: hsl(var(--line-primary))`
  
- [ ] **Create @utility border-secondary**
  - [ ] `border-color: hsl(var(--line-secondary))`
  
- [ ] **Create @utility border-accent**
  - [ ] `border-color: hsl(var(--accent-base))`

---

## Phase 4: Color Accessibility Audit 🎯

### 4.1 Contrast Ratio Testing
- [ ] **Test .premium theme text colors**
  - [ ] `--fg-primary` on `--bg-primary`: Target 7:1 (AAA)
  - [ ] `--fg-secondary` on `--bg-primary`: Target 4.5:1 (AA)
  - [ ] `--fg-tertiary` on `--bg-primary`: Target 4.5:1 (AA)
  - [ ] `--fg-quaternary` on `--bg-primary`: OK if below 4.5:1 (disabled)
  
- [ ] **Test button text contrast**
  - [ ] Primary button text on brand bg: Target 4.5:1
  - [ ] Secondary button text on bg: Target 4.5:1
  - [ ] Disabled button: Can be lower (informational only)

- [ ] **Test interactive state contrast**
  - [ ] Link color vs background: 4.5:1
  - [ ] Hover state vs resting: Perceptible difference
  - [ ] Focus ring vs background: 3:1 minimum

- [ ] **Tools to use**
  - [ ] Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
  - [ ] Use Chrome DevTools: Accessibility > Contrast ratio
  - [ ] Test with daltonism simulation

### 4.2 Fix Identified Contrast Issues
- [ ] **Current potential issues in .premium:**
  
  **Issue 1: --fg-tertiary may be too light**
  ```
  --fg-tertiary: 220 10% 58%; /* #8a8f98 */
  On --bg-primary: 222 20% 3.5%; /* #08090a */
  Estimated: ~9:1 ✅ (likely OK)
  ```
  - [ ] Calculate exact ratio
  - [ ] Adjust if needed
  
  **Issue 2: --fg-quaternary definitely too light**
  ```
  --fg-quaternary: 225 6% 39.6%; /* #62666d */
  On --bg-primary: 222 20% 3.5%; /* #08090a */
  Estimated: ~5:1 ⚠️ (OK for disabled, but check use cases)
  ```
  - [ ] Ensure only used for disabled/placeholder
  - [ ] Never use for actionable text
  
  **Issue 3: Link colors**
  ```
  --link-primary: 240 100% 75%; /* #828fff */
  On --bg-primary: 222 20% 3.5%; /* #08090a */
  ```
  - [ ] Calculate contrast ratio
  - [ ] Darken if needed for accessibility

- [ ] **Document all contrast ratios**
  - [ ] Create contrast matrix table
  - [ ] Add to design system docs
  - [ ] Include WCAG compliance notes

### 4.3 Color Blindness Testing
- [ ] **Test .premium theme with color filters**
  - [ ] Protanopia (red-blind)
  - [ ] Deuteranopia (green-blind)
  - [ ] Tritanopia (blue-blind)
  - [ ] Achromatopsia (grayscale)
  
- [ ] **Verify interactive states**
  - [ ] Don't rely solely on color for state
  - [ ] Add icons/shapes for critical states
  - [ ] Ensure focus rings are thick enough

- [ ] **Test semantic colors**
  - [ ] Error (red) vs Success (green) distinguishable
  - [ ] Warning (amber) vs Info (blue) distinguishable
  - [ ] Consider adding patterns/icons

### 4.4 Fix Premium Theme Brand Color
- [ ] **Current brand confusion**
  ```css
  /* .premium has: */
  --primary: oklch(0.9819 0.0031 253.2500); /* Almost white! */
  --accent: 211 100% 63%; /* #5eb0ff - Accent blue */
  --brand-bg: 235 63% 59%; /* #5e6ad2 - Different blue! */
  ```
  
  - [ ] **Decision needed:** What is the PRIMARY brand color?
    - Option A: Use `#006eff` (Linear blue) everywhere
    - Option B: Use `#5e6ad2` (current brand-bg)
    - Option C: Keep multiple blues for different purposes
  
  - [ ] **Unify brand tokens:**
    - [ ] Set `--primary` to chosen brand color
    - [ ] Set `--accent` to same or complementary
    - [ ] Set `--brand-bg` to same
    - [ ] Ensure consistency across all button states

---

## Phase 5: Premium Theme Polish ✨

### 5.1 Linear-Inspired Refinements
- [ ] **Add subtle animations**
  - [ ] Define `@keyframes linear-fade-in`
  - [ ] Define `@keyframes linear-scale-in`
  - [ ] Define `@keyframes linear-slide-up`
  - [ ] Add to utility classes where appropriate

- [ ] **Enhance gradient system**
  - [ ] Review existing gradients match Linear aesthetic
  - [ ] Add `--gradient-brand` for hero sections
  - [ ] Add `--gradient-subtle` for backgrounds
  - [ ] Test gradient performance

- [ ] **Refine shadow system**
  - [ ] Current shadows may be too heavy for premium
  - [ ] Linear uses very subtle shadows
  - [ ] Consider reducing opacity in .premium
  - [ ] Add `--shadow-border` (1px shadow alternative)

### 5.2 Dark Theme Optimization
- [ ] **Review background hierarchy**
  ```
  --bg-primary: 222 20% 3.5%; /* #08090a - Very dark ✅ */
  --bg-secondary: 220 12% 11%; /* #1c1c1f ✅ */
  --bg-tertiary: 220 8% 13.7%; /* #232326 ✅ */
  ```
  - [ ] Verify perceptible difference between levels
  - [ ] Test on different monitors (brightness variance)
  - [ ] Consider adding option for "true black" mode

- [ ] **Check glow effects**
  - [ ] Add subtle glow to interactive elements
  - [ ] Use `box-shadow: 0 0 20px rgba(accent, 0.15)`
  - [ ] Don't overuse (Linear is subtle)

### 5.3 Typography Integration
- [ ] **Verify font stack**
  ```css
  --font-sans: ui-sans-serif, system-ui, sans-serif...
  ```
  - [ ] Consider adding Inter or SF Pro (Linear uses Inter)
  - [ ] Add to package.json if needed
  - [ ] Update font-sans token

- [ ] **Add typography utilities**
  - [ ] `text-heading-1` through `text-heading-6`
  - [ ] `text-body-lg`, `text-body`, `text-body-sm`
  - [ ] `text-label-lg`, `text-label`, `text-label-sm`
  - [ ] Include font-weight, line-height, letter-spacing

### 5.4 Spacing System Review
- [ ] **Verify consistent spacing**
  - [ ] Check button padding consistency
  - [ ] Check card padding consistency
  - [ ] Ensure gap utilities use same scale
  
- [ ] **Add semantic spacing tokens**
  - [ ] `--space-section` - Between sections
  - [ ] `--space-component` - Within components
  - [ ] `--space-element` - Between elements
  - [ ] `--space-inline` - Inline elements

---

## Phase 6: Testing & Documentation 📚

### 6.1 Visual Regression Testing
- [ ] **Test all components in .premium theme**
  - [ ] Buttons (all variants)
  - [ ] Cards (all variants)
  - [ ] Inputs (all states)
  - [ ] Badges
  - [ ] Links/Navigation
  - [ ] Modals/Dialogs
  - [ ] Dropdowns/Popovers

- [ ] **Test all pages**
  - [ ] Homepage hero section
  - [ ] Features page cards
  - [ ] Pricing page cards
  - [ ] Docs layout
  - [ ] About page
  - [ ] Contact page
  - [ ] Blog page

- [ ] **Cross-theme compatibility**
  - [ ] Switch from light → premium
  - [ ] Switch from dark → premium
  - [ ] Switch from premium → light
  - [ ] No flashes or layout shifts

### 6.2 Performance Testing
- [ ] **CSS bundle size**
  - [ ] Check final CSS file size
  - [ ] Identify any bloat from utilities
  - [ ] Consider PurgeCSS for unused classes
  
- [ ] **Runtime performance**
  - [ ] Test theme switch speed
  - [ ] Check repaint/reflow on hover
  - [ ] Validate 60fps animations

### 6.3 Documentation
- [ ] **Update PREMIUM_THEME_GUIDE.md**
  - [ ] Document all new tokens
  - [ ] Include usage examples
  - [ ] Add "do/don't" guidelines
  
- [ ] **Create utility class reference**
  - [ ] List all @utility classes
  - [ ] Show code examples for each
  - [ ] Include visual examples
  
- [ ] **Update SEMANTIC_COLORS_GUIDE.md**
  - [ ] Add .premium color palette
  - [ ] Include contrast ratios
  - [ ] Document accessibility compliance

### 6.4 Component Library Alignment
- [ ] **Ensure shadcn/ui compatibility**
  - [ ] Test all shadcn components in .premium
  - [ ] Verify token mapping still correct
  - [ ] Update components.json if needed

---

## Phase 7: Code Quality & Cleanup 🧹

### 7.1 Remove Duplicates
- [ ] **Consolidate button tokens in .premium**
  - Current file has duplicate button definitions
  - [ ] Keep the Linear-inspired ones (#006eff)
  - [ ] Remove the purple variants
  - [ ] Verify no references to old tokens

### 7.2 Naming Consistency
- [ ] **Standardize token naming**
  - Some use `--button-primary-bg`
  - Others use `--color-button-primary-bg`
  - [ ] Choose one pattern
  - [ ] Apply everywhere
  - [ ] Update references

### 7.3 CSS Organization
- [ ] **Improve readability**
  - [ ] Add section comments
  - [ ] Group related tokens
  - [ ] Alphabetize within groups
  
- [ ] **Extract to separate files** (optional)
  - [ ] `tokens.css` - All CSS variables
  - [ ] `components.css` - Component classes
  - [ ] `utilities.css` - Utility classes
  - [ ] Import in correct order

### 7.4 TypeScript Integration
- [ ] **Generate type definitions**
  - [ ] Create types for all semantic tokens
  - [ ] Export from `lib/design-tokens.ts`
  - [ ] Use in components for autocomplete

---

## Quick Wins (Do These First) 🚀

1. **Fix duplicate button tokens in .premium** (5 min)
2. **Export brand-* tokens to @theme** (10 min)
3. **Create btn-secondary utility** (15 min)
4. **Test contrast ratios and fix critical issues** (30 min)
5. **Add btn-brand utility for consistent brand actions** (20 min)

---

## Success Criteria ✅

- [ ] All semantic tokens exported to @theme inline
- [ ] No duplicate token definitions
- [ ] All button utilities work in light/dark/premium themes
- [ ] All text passes WCAG AA contrast (4.5:1 minimum)
- [ ] Interactive elements pass WCAG AAA (7:1 ideal)
- [ ] Color blind testing passes for all critical UI
- [ ] 10+ component utility classes created
- [ ] Documentation updated
- [ ] Zero TypeScript/CSS errors
- [ ] Performance: CSS < 50KB gzipped
- [ ] Visual consistency with Linear design system

---

## Timeline Estimate

- **Phase 1**: 3-4 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 4-5 hours
- **Phase 4**: 3-4 hours
- **Phase 5**: 2-3 hours
- **Phase 6**: 2-3 hours
- **Phase 7**: 1-2 hours

**Total**: ~20-25 hours for complete implementation

---

## Next Steps

1. Review this TODO with stakeholders
2. Prioritize phases based on project timeline
3. Start with Quick Wins
4. Test incrementally after each phase
5. Document decisions in design system guide

---

**Last Updated**: 22 January 2026  
**Status**: Ready for implementation  
**Owner**: Design System Team
