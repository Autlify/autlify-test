# Post-Refactoring Validation Checklist

## Quick Start
1. **Dev Server**: ✅ Running on `http://localhost:3000`
2. **Hard Refresh**: Press `Cmd+Shift+R` to see all changes

## Page URLs to Test

### Core Pages
- [ ] Homepage: `http://localhost:3000/site`
- [ ] Features: `http://localhost:3000/site/features`
- [ ] Pricing: `http://localhost:3000/site/pricing`
- [ ] Docs Hub: `http://localhost:3000/site/docs`
- [ ] About: `http://localhost:3000/site/about`
- [ ] Contact: `http://localhost:3000/site/contact`
- [ ] Blog: `http://localhost:3000/site/blog`

### Navigation & Layout
- [ ] Navbar displays with updated links
- [ ] Footer displays with correct links
- [ ] Theme toggle works (check dark mode)
- [ ] Mobile menu works (resize to mobile width)

## Visual Checks

### Homepage (`/site`)
- [ ] Hero H1 is **left-aligned** (not centered)
- [ ] Preview image border uses semantic `border-line-primary`
- [ ] Blue gradient spotlight visible on hero
- [ ] Subtle grid overlay in background
- [ ] Feature cards have hover lift effect
- [ ] CTA buttons use Linear primary gradient

### Pricing Page (`/site/pricing`)
- [ ] Cards use `bg-bg-secondary` background
- [ ] Popular badge shows accent color
- [ ] Feature checkmarks use `accent-base`
- [ ] Border colors are subtle (line-secondary)
- [ ] Hover effects work smoothly
- [ ] Trial/Subscribe buttons styled correctly

### Features Page (`/site/features`)
- [ ] 6 feature cards in 3-column grid
- [ ] Icons display correctly
- [ ] Hover states work (lift + border change)
- [ ] Category labels in accent color
- [ ] Feature highlights with checkmarks

### Docs Page (`/site/docs`)
- [ ] 4 documentation sections in 2-column grid
- [ ] Search bar displays
- [ ] Section icons visible
- [ ] Links formatted correctly
- [ ] Popular topics grid renders

### About Page (`/site/about`)
- [ ] Mission text readable
- [ ] 3 values cards in row
- [ ] Icons centered in cards
- [ ] CTA section at bottom

### Contact Page (`/site/contact`)
- [ ] 4 contact method cards
- [ ] FAQ section displays
- [ ] Email/social links work
- [ ] Cards have hover effect

### Blog Page (`/site/blog`)
- [ ] Category filters display
- [ ] Featured post card prominent
- [ ] Blog grid shows 2 columns
- [ ] Newsletter form displays
- [ ] Date/read time shown

## Theme Compatibility

### Light Theme
- [ ] Backgrounds use light semantic tokens
- [ ] Text contrast is readable
- [ ] Borders subtle but visible
- [ ] Accent colors pop

### Dark Theme
- [ ] Backgrounds use dark semantic tokens
- [ ] Text remains readable
- [ ] Borders visible in dark mode
- [ ] No white flashes

### Premium Theme (if testing)
- [ ] Linear-inspired blue accents
- [ ] Deep backgrounds
- [ ] Refined borders
- [ ] Gradient effects work

## Responsive Checks

### Desktop (>1024px)
- [ ] Multi-column grids display
- [ ] Navbar horizontal
- [ ] Cards aligned properly
- [ ] Spacing comfortable

### Tablet (768px - 1024px)
- [ ] Grids collapse to 2 columns
- [ ] Navbar still horizontal
- [ ] Content readable
- [ ] Images scale

### Mobile (<768px)
- [ ] Single column layout
- [ ] Mobile menu appears
- [ ] Touch targets large enough
- [ ] Images responsive
- [ ] Text readable

## Interaction Checks

### Hover States
- [ ] Cards lift on hover (-translate-y-0.5)
- [ ] Border color changes to accent-tint
- [ ] Background changes to bg-tertiary
- [ ] Subtle gradient appears

### Focus States
- [ ] Links have focus rings
- [ ] Buttons accessible via keyboard
- [ ] Tab order makes sense
- [ ] Focus visible

### Active States
- [ ] Buttons press down (scale-[0.98])
- [ ] Links show active underline
- [ ] Transitions smooth (300ms)

## Bank Card Component Check
- [ ] Navigate to checkout page
- [ ] Card variants render correctly
- [ ] Compact mode works in gallery
- [ ] Hover effects on card
- [ ] Selection indicator shows

## Navigation Flow
- [ ] Home → Features works
- [ ] Features → Pricing works
- [ ] Pricing → Docs works
- [ ] Docs → Blog works
- [ ] Blog → About works
- [ ] About → Contact works
- [ ] Contact → Home works

## Footer Links
- [ ] Product links work
- [ ] Company links work
- [ ] Support links work
- [ ] Legal links point to docs

## Performance
- [ ] Pages load quickly
- [ ] No layout shift
- [ ] Animations smooth (60fps)
- [ ] Images optimized

## Browser Testing (Optional)
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Accessibility Quick Test
- [ ] Tab through navigation
- [ ] Screen reader (VoiceOver) can read content
- [ ] Color contrast passes (use DevTools)
- [ ] Images have alt text
- [ ] Headings hierarchical

## Known Limitations

### Not Yet Implemented
- ❌ Search functionality (UI only)
- ❌ Blog post dynamic routes
- ❌ Newsletter subscription backend
- ❌ Live chat integration
- ❌ Documentation nested routes

### Future Enhancements Needed
- MDX integration for blog/docs
- Backend for search
- CMS integration
- Analytics tracking
- Form submission handlers

## Issues to Report
If you find any issues, note:
- Which page/URL
- What theme (light/dark)
- Browser/device
- Screenshot if possible

## Success Criteria
✅ All core pages render without errors  
✅ Navigation works across all pages  
✅ Theme switching maintains consistency  
✅ Responsive on mobile/tablet/desktop  
✅ Hover/focus states work properly  
✅ No TypeScript/lint errors  
✅ Semantic tokens used throughout  
✅ Linear-inspired aesthetic achieved

---

**Status**: Ready for testing  
**Dev Server**: Running  
**Next Step**: Open browser and test pages
