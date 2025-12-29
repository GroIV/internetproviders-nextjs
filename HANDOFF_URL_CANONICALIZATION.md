# Handoff Document: URL Canonicalization Implementation

**Date:** 2025-12-28
**Project:** InternetProviders.ai (Next.js)
**Working Directory:** `/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs`

---

## Summary

Implemented **URL canonicalization** to change location URLs from 2-letter state codes to full state-name slugs for SEO purposes.

**Before:** `/internet/tx`, `/internet/tx/dallas`
**After:** `/internet/texas`, `/internet/texas/dallas`

---

## Changes Made

### 1. `src/data/states.ts` - MODIFIED

**What changed:**
- Changed object keys from 2-letter codes (`tx`, `ca`) to state-name slugs (`texas`, `california`)
- Added `stateCodeToSlug` lookup table for redirects
- Added `stateNameToSlug()` helper function

**Key sections:**

```typescript
// NEW: Lookup table for redirects
export const stateCodeToSlug: Record<string, string> = {
  al: 'alabama',
  ak: 'alaska',
  // ... all 51 entries
  tx: 'texas',
  dc: 'district-of-columbia',
}

// CHANGED: Keys are now state-name slugs
export const states: Record<string, StateInfo> = {
  'alabama': { code: 'AL', name: 'Alabama', topCities: [...] },
  'texas': { code: 'TX', name: 'Texas', topCities: [...] },
  'new-york': { code: 'NY', name: 'New York', topCities: [...] },
  'north-carolina': { code: 'NC', name: 'North Carolina', topCities: [...] },
  'district-of-columbia': { code: 'DC', name: 'District of Columbia', topCities: [...] },
  // ... 51 total entries
}
```

**Verification:**
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('src/data/states.ts', 'utf8');
const stateKeys = content.match(/'[a-z-]+': \\{ code:/g);
console.log('State entries found:', stateKeys ? stateKeys.length : 0);
"
# Output: State entries found: 51
```

---

### 2. `src/app/internet/page.tsx` - MODIFIED

**What changed:**
- Updated region arrays from 2-letter codes to full state-name slugs

**Before:**
```typescript
const regions = {
  'Northeast': ['ct', 'me', 'ma', 'nh', 'nj', 'ny', 'pa', 'ri', 'vt'],
  'Southeast': ['al', 'ar', 'fl', 'ga', ...],
  // ...
}
```

**After:**
```typescript
const regions = {
  'Northeast': ['connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey', 'new-york', 'pennsylvania', 'rhode-island', 'vermont'],
  'Southeast': ['alabama', 'arkansas', 'florida', 'georgia', 'kentucky', 'louisiana', 'maryland', 'mississippi', 'north-carolina', 'south-carolina', 'tennessee', 'virginia', 'west-virginia', 'district-of-columbia'],
  'Midwest': ['illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota', 'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin'],
  'Southwest': ['arizona', 'new-mexico', 'oklahoma', 'texas'],
  'West': ['alaska', 'california', 'colorado', 'hawaii', 'idaho', 'montana', 'nevada', 'oregon', 'utah', 'washington', 'wyoming'],
}
```

---

### 3. `next.config.ts` - MODIFIED

**What changed:**
- Added 102 new redirect rules (51 state-only + 51 state+city)
- Redirects old 2-letter code URLs to new state-name slug URLs

**Added redirects (excerpt):**
```typescript
// State-only pages
{ source: '/internet/al', destination: '/internet/alabama', permanent: true },
{ source: '/internet/tx', destination: '/internet/texas', permanent: true },
{ source: '/internet/ny', destination: '/internet/new-york', permanent: true },
{ source: '/internet/nc', destination: '/internet/north-carolina', permanent: true },
{ source: '/internet/dc', destination: '/internet/district-of-columbia', permanent: true },
// ... 51 total

// State + city pages
{ source: '/internet/al/:city', destination: '/internet/alabama/:city', permanent: true },
{ source: '/internet/tx/:city', destination: '/internet/texas/:city', permanent: true },
{ source: '/internet/ny/:city', destination: '/internet/new-york/:city', permanent: true },
// ... 51 total
```

**Verification:**
```bash
grep -c "source: '/internet/" next.config.ts
# Output: 102
```

---

### 4. Files NOT Changed (Already Compatible)

These files use `states[state.toLowerCase()]` lookups which work with the new keys:

- `src/app/internet/[state]/page.tsx` - State page routing
- `src/app/internet/[state]/[city]/page.tsx` - City page routing

The dynamic routes still work because:
- URL param `texas` → `states['texas']` → returns Texas info ✓
- `generateStaticParams()` uses `stateList` which now has state-name slugs ✓

---

## Current Issue

### Problem: Dev server not starting

When running `npm run dev`, the server shows:
```
> internetproviders-nextjs@0.1.0 dev
> next dev
```

...and then hangs indefinitely without showing "Ready" or binding to port 3000.

### Attempted Solutions:
1. Killed stale processes (`pkill -f "next"`)
2. Tried `--turbopack` flag
3. Verified no syntax errors in modified files
4. Confirmed 51 state entries in states.ts

### Root Cause (Suspected):
- Many zombie node processes were accumulating (found 6+ at one point)
- System may need restart or `node_modules` reinstall

### To Debug:
```bash
# Kill ALL node processes related to project
pkill -9 -f "internet"

# Check for processes
ps aux | grep internet | grep -v grep

# Try fresh start
cd "/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs"
npm run dev

# If still hanging, try:
rm -rf .next
npm run dev

# Or full reset:
rm -rf node_modules .next
npm install
npm run dev
```

---

## What Needs Verification

Once dev server starts, test these URLs:

1. **New canonical URLs (should work):**
   - http://localhost:3000/internet/texas
   - http://localhost:3000/internet/new-york
   - http://localhost:3000/internet/texas/dallas
   - http://localhost:3000/internet/north-carolina/charlotte

2. **Redirects (should 301 redirect):**
   - http://localhost:3000/internet/tx → /internet/texas
   - http://localhost:3000/internet/ny → /internet/new-york
   - http://localhost:3000/internet/tx/dallas → /internet/texas/dallas

3. **Main listing page:**
   - http://localhost:3000/internet (should show all states with new slugs)

---

## Project Context

### Database
- Supabase PostgreSQL
- Key tables: `providers`, `fcc_providers`, `provider_fcc_map`, `city_definitions`, `cbsa_top_providers_v1`

### Prior Work (Same Session)
- Fixed `frontier` → `frontier-fiber` slug mapping in `provider_fcc_map` table via SQL
- Verified 16 providers correctly mapped

### Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Supabase client

---

## File Locations Summary

| File | Status | Purpose |
|------|--------|---------|
| `src/data/states.ts` | MODIFIED | State data with new slug keys |
| `src/app/internet/page.tsx` | MODIFIED | State listing with new slugs |
| `next.config.ts` | MODIFIED | 301 redirects for old URLs |
| `src/app/internet/[state]/page.tsx` | UNCHANGED | Works with new keys |
| `src/app/internet/[state]/[city]/page.tsx` | UNCHANGED | Works with new keys |

---

## Next Steps

1. Get dev server running (may need system restart or node_modules reinstall)
2. Verify all URLs work correctly
3. Run production build: `npm run build`
4. Deploy to Vercel
5. Verify redirects work in production

---

## Commands Reference

```bash
# Project directory
cd "/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs"

# Start dev server
npm run dev

# Production build
npm run build

# Type check
npx tsc --noEmit

# Kill stale processes
pkill -9 -f "internet"
```
