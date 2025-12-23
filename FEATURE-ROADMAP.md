# InternetProviders.ai Feature Roadmap

Last Updated: December 22, 2025

## Current Status Overview

### Already Built
| Feature | Route | Status | Notes |
|---------|-------|--------|-------|
| Home Page | `/` | Done | ZIP search, hero section |
| Compare Page | `/compare` | Done | ZIP-based provider lookup |
| State Landing Pages | `/internet/[state]` | Done | All 50 states |
| State Directory | `/internet` | Done | Links to all states |
| Provider Directory | `/providers` | Done | List of all providers |
| Provider Detail | `/providers/[slug]` | Done | Individual provider pages |
| Best Fiber Rankings | `/best/fiber-providers` | Done | Top fiber providers |
| Cheapest Providers | `/cheapest/providers` | Done | Budget options |
| Fastest Providers | `/fastest/providers` | Done | Speed rankings |
| Deals Page | `/deals` | Done | Current promotions |
| Guides | `/guides` | Done | 8 dynamic guide templates |
| Guide Detail | `/guides/[slug]` | Done | ZIP-personalized content |
| Speed Test | `/tools/speed-test` | Done | Embedded speed test |
| Plan Quiz | `/tools/quiz` | Done | Interactive recommendation |
| AI Assistant | `/tools/ai-assistant` | Done | Chat interface |
| Tools Hub | `/tools` | Done | Links to all tools |
| About | `/about` | Done | Company info |
| Contact | `/contact` | Done | Contact form |
| Privacy Policy | `/privacy` | Done | Legal page |
| Terms of Service | `/terms` | Done | Legal page |

---

## Internal Linking Audit & Plan

### Current State: WEAK
Only 31 internal links across 16 pages. Major gaps identified:

### Missing Links by Page

| Page | What's Missing |
|------|----------------|
| State Pages (`/internet/[state]`) | Provider names don't link to `/providers/[slug]` |
| State Pages | No "Related Guides" section |
| State Pages | No links to rankings pages |
| State Pages | No neighboring states links |
| Provider Detail (`/providers/[slug]`) | No "Available in these states" links |
| Provider Detail | No "Compare with" links to other providers |
| Provider Detail | No related guides |
| Guides (`/guides/[slug]`) | Provider mentions don't link to provider pages |
| Rankings Pages | Provider names don't link to detail pages |
| Deals Page | Provider names don't link to detail pages |
| Compare Page | Results don't link to provider pages |
| Home Page | No featured guides or rankings links |

### Internal Linking Components to Build

#### 1. RelatedProviders Component
```tsx
// Shows on: state pages, guides, rankings
<RelatedProviders providers={['att', 'spectrum', 'xfinity']} />
```

#### 2. RelatedGuides Component
```tsx
// Shows on: state pages, provider pages, compare
<RelatedGuides category="gaming" zipCode="78250" limit={3} />
```

#### 3. RelatedRankings Component
```tsx
// Shows on: state pages, provider pages
<RelatedRankings links={[
  { href: '/best/fiber-providers', label: 'Best Fiber' },
  { href: '/cheapest/providers', label: 'Cheapest Plans' }
]} />
```

#### 4. NeighboringStates Component
```tsx
// Shows on: state pages
<NeighboringStates currentState="TX" />
```

#### 5. ProviderLink Component (Utility)
```tsx
// Use everywhere provider names appear
<ProviderLink name="AT&T" slug="att" />
// Renders: <Link href="/providers/att">AT&T</Link>
```

### Linking Strategy by Page Type

**State Pages should link to:**
- Provider detail pages (from provider list)
- City pages (when built)
- Compare page (from city cards) ✓ Done
- Guides filtered by state
- Rankings pages
- Neighboring states

**Provider Pages should link to:**
- State pages where available
- Other providers (comparison suggestions)
- Relevant guides
- Deals page if provider has deals

**Guide Pages should link to:**
- Provider detail pages (from content)
- Compare page with ZIP
- Related guides
- Rankings pages

**Rankings Pages should link to:**
- Provider detail pages
- State pages
- Guides

### Implementation Priority

| Task | Priority | Complexity |
|------|----------|------------|
| Create ProviderLink utility | HIGH | Low |
| Add provider links to state pages | HIGH | Low |
| Add provider links to rankings | HIGH | Low |
| Add provider links to deals page | HIGH | Low |
| Create RelatedGuides component | MEDIUM | Medium |
| Add RelatedGuides to state/provider pages | MEDIUM | Low |
| Create NeighboringStates component | MEDIUM | Low |
| Add links within guide content | MEDIUM | Medium |

---

## Phase 1: High Priority Pages

### 1.1 City Provider Pages
**Route:** `/internet/[state]/[city]`
**Example:** `/internet/texas/san-antonio`
**Priority:** HIGH
**Estimated Complexity:** Medium

**Requirements:**
- [ ] Create dynamic route `/internet/[state]/[city]/page.tsx`
- [ ] Lookup city in database (need city data table or derive from ZIP)
- [ ] Show providers available in that city
- [ ] Display city-specific coverage stats
- [ ] Add breadcrumb navigation (Home > Texas > San Antonio)
- [ ] Link from state pages to city pages
- [ ] SEO metadata with city name

**Data Needed:**
- City to CBSA mapping
- City population data (optional)

**Test Checklist:**
- [ ] `/internet/texas/san-antonio` loads correctly
- [ ] Providers shown match San Antonio area
- [ ] Breadcrumbs work
- [ ] Links from state page work
- [ ] Mobile responsive

---

### 1.2 Best Cable Rankings
**Route:** `/best/cable-providers`
**Priority:** HIGH
**Estimated Complexity:** Low

**Requirements:**
- [ ] Create `/best/cable-providers/page.tsx`
- [ ] Query providers filtered by cable technology
- [ ] Rank by coverage and speed
- [ ] Add to navbar Rankings dropdown
- [ ] Add to footer

**Test Checklist:**
- [ ] Page loads with cable providers
- [ ] Rankings make sense
- [ ] Links from nav work

---

### 1.3 FAQ Page
**Route:** `/faq`
**Priority:** HIGH
**Estimated Complexity:** Low

**Requirements:**
- [ ] Create `/faq/page.tsx`
- [ ] Accordion-style FAQ sections
- [ ] Categories: General, Speed, Providers, Pricing, Technical
- [ ] Add FAQ structured data (JSON-LD)
- [ ] Add to footer navigation

**Test Checklist:**
- [ ] Page renders correctly
- [ ] Accordions work (expand/collapse)
- [ ] Structured data validates in Google tool

---

## Phase 2: Comparison Features

### 2.1 Provider vs Provider
**Route:** `/compare/[provider1]-vs-[provider2]`
**Example:** `/compare/att-vs-spectrum`
**Priority:** MEDIUM
**Estimated Complexity:** Medium

**Requirements:**
- [ ] Create dynamic comparison route
- [ ] Side-by-side comparison table
- [ ] Speed, price, technology, coverage comparison
- [ ] Winner badges for each category
- [ ] Generate popular comparisons list
- [ ] SEO-optimized titles

**Data Needed:**
- Provider plans with pricing
- Provider technology types
- Provider coverage areas

**Test Checklist:**
- [ ] `/compare/att-vs-spectrum` loads
- [ ] Comparison data is accurate
- [ ] Both providers shown correctly
- [ ] Page handles invalid providers gracefully

---

### 2.2 Technology Comparison
**Route:** `/compare/fiber-vs-cable`
**Priority:** MEDIUM
**Estimated Complexity:** Low

**Requirements:**
- [ ] Create technology comparison pages
- [ ] Fiber vs Cable
- [ ] Fiber vs DSL
- [ ] Cable vs 5G Home
- [ ] Pros/cons for each technology
- [ ] Speed comparisons
- [ ] Provider examples for each type

**Test Checklist:**
- [ ] All comparison pages load
- [ ] Content is accurate
- [ ] Internal links work

---

### 2.3 Coverage Map
**Route:** `/coverage-map` or embedded in compare
**Priority:** MEDIUM
**Estimated Complexity:** High

**Requirements:**
- [ ] Interactive US map component
- [ ] Color-coded by coverage level
- [ ] Click state to drill down
- [ ] Provider filter overlay
- [ ] Technology filter (fiber/cable/wireless)
- [ ] Consider: Mapbox, Leaflet, or simple SVG

**Data Needed:**
- State-level coverage stats
- County-level coverage (optional)

**Test Checklist:**
- [ ] Map renders on all browsers
- [ ] State clicks work
- [ ] Filters update map
- [ ] Mobile touch works

---

## Phase 3: Geographic Expansion

### 3.1 County Provider Pages
**Route:** `/internet/[state]/county/[county]`
**Example:** `/internet/texas/county/bexar`
**Priority:** MEDIUM
**Estimated Complexity:** Medium

**Requirements:**
- [ ] Create county route structure
- [ ] County to ZIP/CBSA mapping
- [ ] Aggregate coverage stats by county
- [ ] Link counties from state pages

**Data Needed:**
- County FIPS codes
- County to ZIP mapping

---

### 3.2 Neighborhood Pages
**Route:** `/internet/[state]/[city]/[neighborhood]`
**Priority:** LOW
**Estimated Complexity:** High

**Requirements:**
- [ ] Neighborhood boundary data
- [ ] Street-level coverage where available
- [ ] Local provider recommendations

**Data Needed:**
- Neighborhood boundaries (complex)
- Address-level data (expensive)

---

## Phase 4: Speed Tier Content

### 4.1 Speed Tier Pages
**Routes:**
- `/internet-speeds/1-gig`
- `/internet-speeds/2-gig`
- `/internet-speeds/5-gig`
- `/internet-speeds/multi-gig`

**Priority:** LOW
**Estimated Complexity:** Low

**Requirements:**
- [ ] Create speed tier template
- [ ] List providers offering each tier
- [ ] Use cases for each speed
- [ ] Price comparisons at each tier
- [ ] "Is X Mbps enough?" content

---

### 4.2 Frontier Fiber Hub
**Route:** `/providers/frontier/fiber`
**Priority:** LOW
**Estimated Complexity:** Medium

**Requirements:**
- [ ] Frontier-specific landing pages
- [ ] State-by-state Frontier coverage
- [ ] Frontier plan details
- [ ] Frontier vs competitors

---

## Phase 5: Trust & SEO

### 5.1 Author Profiles
**Route:** `/authors/[slug]`
**Priority:** LOW
**Estimated Complexity:** Low

**Requirements:**
- [ ] Create authors table in database
- [ ] Author profile pages with bio
- [ ] Link articles/guides to authors
- [ ] Author schema markup for E-E-A-T

---

### 5.2 Data Hub
**Route:** `/data`
**Priority:** LOW
**Estimated Complexity:** Medium

**Requirements:**
- [ ] Interactive data visualizations
- [ ] Coverage statistics by state
- [ ] Speed trends over time
- [ ] Provider market share
- [ ] Downloadable reports (PDF)

---

## Components to Build

### High Priority Components

| Component | Purpose | Priority | Notes |
|-----------|---------|----------|-------|
| AddressAutocomplete | Street-level lookup | HIGH | Use Google Places API |
| ProviderLogo | Display real logos | HIGH | Store in /public/logos |
| Breadcrumbs | Navigation trail | HIGH | Reusable component |
| StructuredData | SEO JSON-LD | HIGH | FAQ, Organization, Service |

### Medium Priority Components

| Component | Purpose | Priority | Notes |
|-----------|---------|----------|-------|
| SpeedComparisonChart | Visual speed bars | MEDIUM | Use Chart.js or Recharts |
| TrustSignals | Awards, ratings | MEDIUM | Add to provider cards |
| CookieConsent | GDPR compliance | MEDIUM | Use consent library |
| NewsletterSignup | Email capture | MEDIUM | Footer component |

### Low Priority Components

| Component | Purpose | Priority | Notes |
|-----------|---------|----------|-------|
| ExpertByline | Author attribution | LOW | For guides/articles |
| RelatedLinks | SEO internal linking | LOW | Automated suggestions |
| ShareButtons | Social sharing | LOW | For guides |

---

## Database Schema Additions Needed

### Cities Table
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_code CHAR(2) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  population INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cbsa_code VARCHAR(5),
  UNIQUE(slug, state_code)
);
```

### Counties Table
```sql
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_code CHAR(2) NOT NULL,
  fips_code CHAR(5) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL,
  population INTEGER
);
```

### Authors Table
```sql
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(255),
  credentials VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Protocol

For each feature, complete these tests before marking done:

### Functionality Tests
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] All links work
- [ ] Forms submit properly
- [ ] Error states handled

### Responsive Tests
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

### SEO Tests
- [ ] Title tag set correctly
- [ ] Meta description present
- [ ] Open Graph tags
- [ ] Canonical URL
- [ ] Structured data validates

### Performance Tests
- [ ] Page loads < 3 seconds
- [ ] Images optimized
- [ ] No layout shift

---

## Work Log

### Session 1 - December 22, 2025
- [x] Fixed guides to use dynamic city names
- [x] Deployed latest version to Vercel
- [x] Created this roadmap document

### Next Session Tasks
1. Build City Provider Pages
2. Add Best Cable Rankings
3. Create FAQ page with structured data

---

## Quick Reference: File Locations

```
src/app/
├── internet/
│   ├── page.tsx           # State directory
│   ├── [state]/
│   │   └── page.tsx       # State landing (exists)
│   │   └── [city]/        # TO BUILD
│   │       └── page.tsx
├── compare/
│   ├── page.tsx           # ZIP compare (exists)
│   └── [comparison]/      # TO BUILD (att-vs-spectrum)
│       └── page.tsx
├── best/
│   ├── fiber-providers/   # EXISTS
│   └── cable-providers/   # TO BUILD
├── faq/                   # TO BUILD
│   └── page.tsx
├── internet-speeds/       # TO BUILD
│   └── [tier]/
│       └── page.tsx
└── coverage-map/          # TO BUILD
    └── page.tsx
```
