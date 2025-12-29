# Animation & Styling Analysis for InternetProviders.ai

This document describes the animation patterns, component library, and styling system used in the InternetProviders.ai Next.js site. Use this as a reference when generating content that needs to match the site's futuristic aesthetic.

---

## 1. Animation Library: Framer Motion

**Package:** `framer-motion@12.23.26`

Used extensively throughout the site for:
- Scroll-triggered reveals (`useInView`)
- Parallax effects (`useScroll`, `useTransform`)
- 3D tilt effects (`useMotionValue`, `useSpring`)
- Staggered animations

---

## 2. Card Hover Effects

The lift, glow, and corner accent pattern uses CSS + Tailwind + Framer Motion:

```tsx
// Example from homepage provider cards
<Link className="group block relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
  {/* Gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />

  {/* Glow effect behind logo */}
  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
</Link>
```

**Key patterns:**
- `hover:-translate-y-1` - Lift effect
- `hover:shadow-lg hover:shadow-cyan-500/10` - Glow shadow
- `hover:border-cyan-500/50` - Border accent
- `group-hover:opacity-X` - Child elements react to parent hover

---

## 3. Futuristic UI Components

### Available Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TiltCard` | `src/components/ui/TiltCard.tsx` | 3D tilt on hover with mouse-following glow |
| `GlowingBorder` | `src/components/effects/GlowingBorder.tsx` | Animated border glow with color options |
| `AuroraBlobs` | `src/components/effects/AuroraBlobs.tsx` | Slow-moving colored blobs as backgrounds |
| `CircuitPattern` | `src/components/effects/CircuitPattern.tsx` | SVG circuit board pattern with animated data pulses |
| `ScrollReveal` | `src/components/ui/ScrollReveal.tsx` | Fade-in on scroll (direction: up/down/left/right/scale) |
| `StaggerContainer` | `src/components/ui/StaggerContainer.tsx` | Children animate in sequence |

### TiltCard Component

```tsx
// src/components/ui/TiltCard.tsx
<TiltCard glowColor="cyan" tiltIntensity={10} glowIntensity={0.3} scale={1.02}>
  {/* Card content */}
</TiltCard>
```

Props:
- `glowColor`: 'cyan' | 'blue' | 'purple' | 'pink' | 'orange' | 'emerald'
- `tiltIntensity`: number (default 10)
- `glowIntensity`: number (default 0.3)
- `scale`: number (default 1.02)

### GlowingBorder Component

```tsx
// src/components/effects/GlowingBorder.tsx
<GlowingBorder color="cyan" animated={true} intensity="medium">
  {/* Content */}
</GlowingBorder>
```

Props:
- `color`: 'blue' | 'cyan' | 'purple' | 'gradient'
- `animated`: boolean (pulsing glow)
- `intensity`: 'low' | 'medium' | 'high'

### AuroraBlobs Component

```tsx
// src/components/effects/AuroraBlobs.tsx
<AuroraBlobs opacity={0.12} />
```

Creates 5 slowly-moving, blurred color blobs (blue, cyan, purple, pink, orange) that float around the background.

### CircuitPattern Component

```tsx
// src/components/effects/CircuitPattern.tsx
<CircuitPattern opacity={0.08} animated={true} />
```

Creates an SVG circuit board pattern with animated data pulses traveling along the lines.

---

## 4. Visual Patterns

### Glass Morphism
```css
bg-gray-900/50 backdrop-blur-sm
```

### Neon Text Effects
```css
.neon-text-subtle  /* Subtle glow */
.holographic       /* Animated holographic shimmer */
```

### Gradient Text
```css
bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent
```

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | #06b6d4 | Primary accent, speed indicators |
| Blue | #3b82f6 | Secondary accent, links |
| Purple | #8b5cf6 | Premium tier, fiber technology |
| Green | #10b981 | Budget tier, success states |
| Amber | #f59e0b | Warnings, DSL technology |

---

## 5. Animated Backgrounds

### Hero Section Parallax Orbs

```tsx
// page.tsx hero section
const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
const orbsY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

<motion.div
  className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
  style={{ y: orbsY }}
/>
```

### Section Background Pattern

```tsx
<section className="py-12 relative overflow-hidden">
  {/* Background effects layer */}
  <div className="absolute inset-0 data-grid opacity-20" />
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

  <div className="container mx-auto px-4 relative z-10">
    {/* Content */}
  </div>
</section>
```

---

## 6. Content Section Structure with Animations

```tsx
// Typical animated section structure
<section className="py-12 border-t border-gray-800 relative overflow-hidden">
  {/* Background effects layer */}
  <div className="absolute inset-0 data-grid opacity-20" />
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

  <div className="container mx-auto px-4 relative z-10">
    {/* Animated header */}
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-bold">
        <span className="holographic">Title</span>
      </h2>
    </motion.div>

    {/* Staggered content grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          {/* Card content */}
        </motion.div>
      ))}
    </div>
  </div>
</section>
```

---

## 7. Static HTML Content Generation

Since editorial content is **pre-generated HTML** rendered via `dangerouslySetInnerHTML`, **JavaScript animations won't work directly**. Use the CSS classes from `ipai-styles.css` instead.

### Available CSS Classes

#### Layout
```css
.ipai-container          /* Max-width 1280px, centered */
.ipai-container--narrow  /* Max-width 768px */
.ipai-container--wide    /* Max-width 1536px */
.ipai-grid               /* CSS Grid with gap */
.ipai-grid--2            /* 2 columns (responsive) */
.ipai-grid--3            /* 3 columns (responsive) */
.ipai-grid--4            /* 4 columns (responsive) */
.ipai-stats-grid         /* 2 cols mobile, 4 cols desktop */
```

#### Cards
```css
.ipai-card               /* Basic card with border */
.ipai-card__glow         /* Radial glow overlay */
.ipai-card__content      /* Padded content area */
.ipai-glass              /* Glass morphism card */
.ipai-plan-card          /* Plan comparison card */
.ipai-plan-card--budget  /* Green gradient accent */
.ipai-plan-card--value   /* Cyan gradient accent */
.ipai-plan-card--premium /* Purple gradient accent */
.ipai-stat-card          /* Stats display card */
.ipai-stat-card--cyan    /* Cyan icon color */
.ipai-stat-card--green   /* Green icon color */
.ipai-stat-card--purple  /* Purple icon color */
```

#### Badges
```css
.ipai-tech-badge         /* Technology indicator */
.ipai-tech-badge--fiber  /* Purple - Fiber */
.ipai-tech-badge--cable  /* Blue - Cable */
.ipai-tech-badge--5g     /* Cyan - 5G */
.ipai-tech-badge--dsl    /* Amber - DSL */
.ipai-tech-badge--satellite      /* Gray - Satellite */
.ipai-tech-badge--fixed-wireless /* Green - Fixed Wireless */
.ipai-tier-badge         /* Plan tier indicator */
.ipai-tier-badge--budget /* Green */
.ipai-tier-badge--value  /* Cyan */
.ipai-tier-badge--premium /* Purple */
.ipai-tag                /* Generic tag */
.ipai-tag--cyan          /* Cyan variant */
.ipai-tag--green         /* Green variant */
.ipai-tag--purple        /* Purple variant */
```

#### Buttons
```css
.ipai-btn                /* Base button */
.ipai-btn--primary       /* Gradient cyan-blue */
.ipai-btn--secondary     /* Dark with border */
.ipai-btn--ghost         /* Transparent */
.ipai-btn--lg            /* Large size */
```

#### Typography (inside .ipai-prose wrapper)
```css
/* Automatic styling for: */
h2    /* 1.875rem, bold, cyan gradient underline */
h3    /* 1.5rem, semibold */
p     /* 1.125rem line-height, secondary color */
ul/ol /* Left padding, spacing */
li    /* Secondary color */
a     /* Cyan with hover effect */
strong /* White text */
code   /* Inline code styling */
```

#### CTA Section
```css
.ipai-cta-section        /* Gradient background section */
.ipai-cta-section__glow  /* Radial glow effect */
.ipai-cta-section__content /* Content wrapper */
.ipai-cta-section__title /* Large white heading */
.ipai-cta-section__text  /* Muted description */
.ipai-cta-section__buttons /* Button group */
```

#### Tables
```css
.ipai-table-wrap         /* Responsive table wrapper */
```

#### Breadcrumbs
```css
.ipai-breadcrumb         /* Breadcrumb nav */
.ipai-breadcrumb__separator /* "/" divider */
.ipai-breadcrumb__current /* Current page (white) */
```

---

## 8. Recommended Approach for Generated Content

### Option A: CSS-Only (Static HTML)

Generate HTML that uses the `ipai-*` classes for styling. These have built-in hover effects via CSS:

```html
<div class="ipai-card">
  <div class="ipai-card__glow"></div>
  <div class="ipai-card__content">
    <h3>Card Title</h3>
    <p>Card description...</p>
  </div>
</div>
```

### Option B: Wrap with React Components (Template-Level)

The page templates can wrap static HTML with animated background components:

```tsx
// In the page template (e.g., guides/[category]/[slug]/page.tsx)
export default async function GuidePage({ params }) {
  const content = await getContentByPath(path)

  return (
    <>
      <AuroraBlobs opacity={0.08} />  {/* Animated background */}
      <div className="relative z-10">
        <article
          className="ipai-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      </div>
    </>
  )
}
```

### Option C: Use React Components Instead of Static HTML

For highly interactive content, consider storing component references in the database instead of pre-rendered HTML, then rendering them dynamically.

---

## 9. Example: Complete Article HTML Structure

```html
<div class="ipai-container ipai-container--narrow">
  <!-- Hero/Intro -->
  <div class="ipai-card" style="margin-bottom: 2rem;">
    <div class="ipai-card__glow"></div>
    <div class="ipai-card__content">
      <span class="ipai-tier-badge ipai-tier-badge--value">Technology Guide</span>
      <h1 style="font-size: 2.25rem; font-weight: 700; margin-top: 1rem;">
        5G Home Internet: Complete Guide
      </h1>
      <p style="color: #9ca3af; font-size: 1.125rem;">
        Everything you need to know about 5G fixed wireless internet for your home.
      </p>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="ipai-stats-grid" style="margin-bottom: 2rem;">
    <div class="ipai-stat-card ipai-stat-card--cyan">
      <div class="ipai-stat-card__label">Max Speed</div>
      <div class="ipai-stat-card__value">1 Gbps</div>
    </div>
    <div class="ipai-stat-card ipai-stat-card--green">
      <div class="ipai-stat-card__label">Starting Price</div>
      <div class="ipai-stat-card__value">$40/mo</div>
    </div>
    <div class="ipai-stat-card ipai-stat-card--purple">
      <div class="ipai-stat-card__label">Availability</div>
      <div class="ipai-stat-card__value">Growing</div>
    </div>
    <div class="ipai-stat-card">
      <div class="ipai-stat-card__label">Contract</div>
      <div class="ipai-stat-card__value">None</div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="ipai-prose">
    <h2>What is 5G Home Internet?</h2>
    <p>
      5G home internet uses cellular towers to deliver high-speed internet
      to your home without the need for cable or fiber connections...
    </p>

    <h3>Key Benefits</h3>
    <ul>
      <li>No installation required - just plug in the gateway</li>
      <li>No contracts or data caps (with most providers)</li>
      <li>Speeds comparable to cable internet</li>
    </ul>
  </div>

  <!-- CTA -->
  <div class="ipai-cta-section" style="margin-top: 3rem;">
    <div class="ipai-cta-section__glow"></div>
    <div class="ipai-cta-section__content">
      <h2 class="ipai-cta-section__title">Check 5G Availability</h2>
      <p class="ipai-cta-section__text">
        Enter your ZIP code to see if 5G home internet is available in your area.
      </p>
      <div class="ipai-cta-section__buttons">
        <a href="/compare" class="ipai-btn ipai-btn--primary ipai-btn--lg">
          Check Availability
        </a>
      </div>
    </div>
  </div>
</div>
```

---

## 10. File Locations Reference

```
src/app/ipai-styles.css                    # CSS component library
src/app/globals.css                        # Global styles (imports ipai-styles)
src/components/ui/TiltCard.tsx             # 3D tilt card
src/components/ui/ScrollReveal.tsx         # Scroll-triggered fade-in
src/components/ui/StaggerContainer.tsx     # Staggered children animation
src/components/effects/GlowingBorder.tsx   # Animated border glow
src/components/effects/AuroraBlobs.tsx     # Floating color blobs
src/components/effects/CircuitPattern.tsx  # Circuit board SVG pattern
src/lib/getContent.ts                      # Content fetching helper
src/app/guides/[category]/[slug]/page.tsx  # Guide template
src/app/providers/[slug]/page.tsx          # Provider template (with content override)
src/app/internet/[state]/[city]/page.tsx   # City template (with content override)
src/app/compare/[comparison]/page.tsx      # Comparison template (with content override)
```
