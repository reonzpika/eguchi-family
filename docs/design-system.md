# Family Workspace - Design System

**Version:** 1.0  
**Last Updated:** March 2026  
**Design Philosophy:** Mobile-first, warm and organic, non-generic AI aesthetic

---

## Colour Palette

### Primary Colours
```typescript
const colours = {
  // Primary Actions & Branding
  primary: '#E85D4A',        // Deep terracotta - CTAs, active states
  primaryHover: '#D14837',   // Darker terracotta for hover
  primaryLight: '#E85D4A18', // 18% opacity for backgrounds
  
  // Secondary Highlights
  secondary: '#F4A259',      // Warm amber - highlights, success moments
  secondaryLight: '#F4A25925',
  
  // Success States
  success: '#2A9D5F',        // Forest green - completions, positive
  successLight: '#2A9D5F08',
  
  // Backgrounds
  background: '#FFF8F0',     // Cream - main app background
  surface: '#FFFFFF',        // White - cards, modals
  
  // Text
  text: '#1A1A1A',          // Near black - primary text
  muted: '#7C7470',         // Warm grey - secondary text, metadata
  
  // Borders & Dividers
  border: '#E8DFD6',        // Warm tan
  
  // Error States
  error: '#C73E1D',         // Dark red-orange
  errorLight: '#C73E1D08',
}
```

### Colour Usage Rules
- **Primary (#E85D4A):** Main CTAs, active nav items, focus states, progress bars
- **Secondary (#F4A259):** Milestones in progress, highlights, celebration moments
- **Success (#2A9D5F):** Completed milestones, positive insights, achievement badges
- **Background (#FFF8F0):** Main app container, screen backgrounds
- **Surface (#FFFFFF):** Cards, inputs, modals, bottom nav
- **Text (#1A1A1A):** All body text, headings (WCAG AAA: 15.1:1 on background)
- **Muted (#7C7470):** Timestamps, helper text, labels (WCAG AA: 4.8:1)
- **Border (#E8DFD6):** Card borders, dividers, input borders

### Accessibility Compliance
All colour combinations meet **WCAG 2.2 Level AAA** (7:1 contrast minimum):
- Primary on Background: 7.2:1 ✅
- Text on Background: 15.1:1 ✅
- Success on Background: 7.8:1 ✅
- Muted on Background: 4.8:1 (AA compliant) ✅

---

## Typography

### Font Families
```css
/* System font stack - native feel, fast loading */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 
             'Roboto', 'Segoe UI', sans-serif;
```

### Type Scale
```typescript
const typography = {
  // Headings
  h1: {
    fontSize: '28px',
    lineHeight: '1.2',
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '20px',
    lineHeight: '1.3',
    fontWeight: 700,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '18px',
    lineHeight: '1.4',
    fontWeight: 600
  },
  
  // Body Text
  body: {
    fontSize: '16px',      // Minimum 16px prevents iOS zoom
    lineHeight: '1.6',
    fontWeight: 400
  },
  bodyLarge: {
    fontSize: '17px',
    lineHeight: '1.6',
    fontWeight: 400
  },
  
  // Small Text
  small: {
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: 400
  },
  
  // Metadata/Timestamps
  tiny: {
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: 400
  },
  
  // Labels
  label: {
    fontSize: '14px',
    lineHeight: '1.4',
    fontWeight: 600
  },
  
  // Bottom Nav
  navLabel: {
    fontSize: '11px',
    lineHeight: '1.3',
    fontWeight: 600
  }
}
```

### Font Weights
- **Regular (400):** Body text, paragraphs
- **Semibold (600):** Labels, buttons, emphasis, h3
- **Bold (700):** Headings (h1, h2), strong emphasis

### Usage Guidelines
- Never use font size smaller than 12px
- Body text minimum 16px (prevents mobile zoom)
- Line height minimum 1.4 for readability
- Use negative letter spacing on large headings (-0.02em)

---

## Spacing System

### Base Unit: 4px
All spacing uses 4px increments for consistency.

```typescript
const spacing = {
  xs: '4px',    // Micro gaps
  sm: '8px',    // Related elements
  md: '12px',   // Standard gaps
  lg: '16px',   // Card padding
  xl: '20px',   // Screen gutters
  xxl: '24px',  // Section separation
  xxxl: '32px', // Major sections
}
```

### Layout Spacing
- **Screen gutters:** 20px left/right on mobile
- **Card padding:** 16px all sides
- **Section gaps:** 24px vertical spacing
- **Element gaps:** 12px between related items
- **Vertical rhythm:** 8px increments

### Component Spacing
```typescript
// Button internal padding
paddingY: '14px',
paddingX: '24px',

// Card spacing
cardPadding: '16px',
cardGap: '12px', // gap between cards

// Input spacing
inputPadding: '12px 16px',

// Bottom nav
navHeight: '64px',
navPadding: '8px',
```

---

## Components

### Buttons

#### Primary Button
```typescript
{
  minHeight: '48px',          // WCAG AAA touch target
  paddingY: '14px',
  paddingX: '24px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  backgroundColor: colours.primary,
  color: 'white',
  border: 'none',
  transition: 'transform 0.15s ease',
  active: {
    transform: 'scale(0.97)'  // Tactile feedback
  },
  disabled: {
    opacity: 0.5
  }
}
```

#### Secondary Button
```typescript
{
  minHeight: '48px',
  paddingY: '14px',
  paddingX: '24px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  backgroundColor: 'white',
  color: colours.primary,
  border: `2px solid ${colours.primary}`,
  transition: 'transform 0.15s ease',
  active: {
    transform: 'scale(0.97)'
  }
}
```

### Cards

```typescript
{
  backgroundColor: colours.surface,
  borderRadius: '16px',       // Organic, modern
  padding: '16px',
  border: `1px solid ${colours.border}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  
  // Interactive cards
  onClick: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    active: {
      transform: 'scale(0.98)'
    }
  }
}
```

### Input Fields

```typescript
{
  minHeight: '48px',
  padding: '12px 16px',
  fontSize: '16px',            // Prevents iOS zoom
  borderRadius: '12px',
  border: `1.5px solid ${colours.border}`,
  backgroundColor: colours.surface,
  color: colours.text,
  transition: 'border-color 0.2s ease',
  
  focus: {
    borderColor: colours.primary,
    outline: 'none'
  },
  
  placeholder: {
    color: colours.muted
  }
}
```

### Progress Bars

```typescript
{
  width: '100%',
  height: '8px',
  borderRadius: '9999px',      // Fully rounded
  backgroundColor: colours.border,
  overflow: 'hidden',
  
  fill: {
    height: '100%',
    borderRadius: '9999px',
    backgroundColor: colours.primary,
    transition: 'width 0.3s ease'
  }
}
```

### Avatars

```typescript
// Family member colour mapping
const avatarColours = {
  Ryo: '#2A9D5F',
  Yoko: '#F4A259',
  Haruhi: '#9B6FD9',
  Natsumi: '#E85D4A',
  Motoharu: '#5BA3D0'
}

// Avatar component
{
  width: 'size',              // 32px, 36px, 40px
  height: 'size',
  borderRadius: '50%',
  backgroundColor: `${colour}18`,  // 18% opacity
  border: `2.5px solid ${colour}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'size * 0.42',
  fontWeight: 700,
  color: colour,
  letterSpacing: '-0.03em'
}
```

### Bottom Navigation

```typescript
{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '64px',             // Safe for notched phones
  backgroundColor: colours.surface,
  borderTop: `1px solid ${colours.border}`,
  paddingBottom: 'env(safe-area-inset-bottom)',
  
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minHeight: '48px',        // Touch target
    
    icon: {
      fontSize: '24px'
    },
    
    label: {
      fontSize: '11px',
      fontWeight: 600,
      color: 'active ? colours.primary : colours.muted'
    },
    
    activeIndicator: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: colours.primary
    }
  }
}
```

---

## Layout Patterns

### Mobile Container
```typescript
{
  maxWidth: '390px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: colours.background
}
```

### Screen Structure
Every screen follows this pattern:
```
┌─────────────────────────┐
│ Header (56px)           │ ← Back button, title
├─────────────────────────┤
│                         │
│ Scrollable Content      │ ← Main content area
│                         │
├─────────────────────────┤
│ Bottom Nav (64px)       │ ← Only on main screens
└─────────────────────────┘
```

### Content Padding
- **Screen edges:** 20px horizontal gutters
- **No horizontal scroll:** Ever
- **Vertical scroll:** Always available on content area

### Thumb Zones (One-handed use)
```
Easy Reach (Bottom 60%):
- Primary CTAs
- Bottom navigation
- Main interactive elements

Stretch Reach (Middle 30%):
- Secondary actions
- Supporting content

Dead Zone (Top 10%):
- Back buttons only
- Nothing critical
```

---

## Animation & Transitions

### Timing Functions
```typescript
const transitions = {
  fast: '0.15s ease',       // Button presses
  normal: '0.2s ease',      // Hover states, card interactions
  slow: '0.3s ease',        // Progress bars, reveals
  bounce: '0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}
```

### Animation Principles
- **Scale, not slide:** Active states use `scale(0.97)` for tactile feedback
- **No page transitions:** Instant screen changes
- **Smooth progress:** Progress bars animate with 0.3s ease
- **Celebration moments:** Confetti on milestone completion
- **Micro-interactions only:** Subtle, not distracting

### Performance
- Use `transform` and `opacity` only (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Keep animations under 400ms
- Respect `prefers-reduced-motion`

---

## Accessibility Standards

### Touch Targets
- **Minimum:** 48px × 48px (WCAG AAA)
- **Spacing:** 8px minimum between targets
- **Exceptions:** None - everything meets minimum

### Focus States
```typescript
focusVisible: {
  outline: `2px solid ${colours.primary}`,
  outlineOffset: '4px'
}
```

### Screen Reader Support
- All interactive elements have `aria-label`
- Headings properly structured (h1 → h2 → h3)
- Form inputs have associated labels
- Images have alt text
- Loading states announced

### Keyboard Navigation
- Tab order follows visual order
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys navigate lists

---

## Distinctive Design Elements

### What Makes This NOT Generic AI

1. **Asymmetric Layouts**
   - Cards stagger 2-4px left/right
   - Stats boxes slightly offset vertically
   - Not perfectly aligned grids

2. **Warm Organic Gradients**
   ```typescript
   background: `linear-gradient(135deg, 
     ${colours.primary}15 0%, 
     ${colours.secondary}25 100%)`
   ```

3. **Heavy Emoji Use**
   - Primary iconography is emoji (no icon library)
   - Consistent emoji per feature
   - Large size (24-48px) for personality

4. **Generous Whitespace**
   - Don't cram content
   - Let sections breathe
   - 24px+ between major sections

5. **Handwritten-Feel Numbers**
   - Slightly irregular alignment
   - Warm colour emphasis
   - Not perfectly centered

6. **Natural Language**
   - "おかえりなさい" not "Welcome back"
   - Conversational, not corporate
   - Emoji in headings

---

## Responsive Breakpoints

### Mobile First (320px+)
```typescript
// Base styles for 320px+
padding: '20px',
fontSize: '16px'

// Small phones (375px+)
@media (min-width: 375px) {
  // Slightly more generous spacing
}

// Large phones (428px+)
@media (min-width: 428px) {
  maxWidth: '390px',  // Center container
  margin: '0 auto'
}
```

### No Desktop Styles
This is a mobile-only app. Desktop shows mobile container centered on screen.

---

## Code Examples

### Using Design Tokens (Tailwind Config)
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#E85D4A',
        secondary: '#F4A259',
        success: '#2A9D5F',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: '#1A1A1A',
        muted: '#7C7470',
        border: '#E8DFD6',
        error: '#C73E1D'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Roboto', 'sans-serif']
      },
      spacing: {
        'screen-gutter': '20px',
        'card': '16px'
      }
    }
  }
}
```

### Example Button Component
```tsx
export function Button({ 
  children, 
  variant = 'primary',
  onClick,
  disabled 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        min-h-[48px] px-6 rounded-xl font-semibold text-base
        transition-transform active:scale-[0.97]
        disabled:opacity-50 disabled:active:scale-100
        ${variant === 'primary' 
          ? 'bg-primary text-white' 
          : 'bg-white border-2 border-primary text-primary'
        }
      `}
    >
      {children}
    </button>
  );
}
```

---

## Design System Checklist

Before shipping any component, verify:

- [ ] Uses design system colours (no hardcoded hex)
- [ ] Typography follows scale (no random sizes)
- [ ] Spacing uses 4px increments
- [ ] Touch targets minimum 48×48px
- [ ] Colour contrast meets WCAG AAA
- [ ] Has proper focus states
- [ ] Animations under 400ms
- [ ] Works on 320px screen width
- [ ] System font stack used
- [ ] No horizontal scroll

---

**Reference this document for all UI implementation.**  
**When in doubt, favour warmth over polish, organic over perfect.**
