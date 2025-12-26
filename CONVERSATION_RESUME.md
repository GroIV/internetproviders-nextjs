# InternetProviders.ai - Conversation Resume Document

**Created:** December 25, 2024
**Project Path:** `/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs`
**Live Site:** https://internetproviders-nextjs.vercel.app
**GitHub:** https://github.com/GroIV/internetproviders-nextjs

---

## Project Overview

InternetProviders.ai is a Next.js 16 web application that helps users find and compare internet service providers by ZIP code. Features include:

- AI-powered chat assistant on every page
- ZIP code-based provider lookup using FCC Broadband Data
- Provider comparisons (e.g., AT&T vs Xfinity)
- Technology comparisons (Fiber vs Cable)
- Speed test tool
- ISP recommendation quiz
- Guides and educational content

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Animations:** Framer Motion
- **AI:** OpenAI API for chat

---

## Recent Session Changes (Dec 25, 2024)

### 1. Visual Enhancements Applied to All Pages
Applied consistent visual styling across the entire site:
- `gradient-text-*` classes for headers (ocean, fresh, purple, sunset, rainbow, warm)
- `futuristic-card` with `corner-accent` for content sections
- `glow-burst-hover` and `glow-burst-emerald` effects
- Added `gradient-text-purple` class to globals.css

**Files modified:**
- `/src/app/about/page.tsx`
- `/src/app/contact/page.tsx`
- `/src/app/deals/page.tsx`
- `/src/app/faq/page.tsx`
- `/src/app/tools/page.tsx`
- `/src/app/guides/page.tsx`
- `/src/app/compare/page.tsx`
- `/src/app/best/fiber-providers/page.tsx`
- `/src/app/best/cable-providers/page.tsx`
- `/src/app/fastest/providers/page.tsx`
- `/src/app/cheapest/providers/page.tsx`
- `/src/app/internet/page.tsx`
- `/src/app/providers/[slug]/page.tsx`
- `/src/app/globals.css`

### 2. Mobile Responsiveness Fixes

**Stats grids:** Changed `grid-cols-3` to `grid-cols-1 sm:grid-cols-3` on:
- `/src/app/best/fiber-providers/page.tsx`
- `/src/app/best/cable-providers/page.tsx`
- `/src/app/fastest/providers/page.tsx`
- `/src/app/cheapest/providers/page.tsx`

**Chat component heights:**
- `ChatWindow.tsx`: Changed to `h-[55vh] sm:h-[60vh] min-h-[350px] sm:min-h-[400px]`
- `PageChatSection.tsx`: Changed to `h-[300px] sm:h-[350px]`
- Homepage stats gap: `gap-2 sm:gap-4`

### 3. Compare Page Auto-Redirect
Created `/src/components/CompareAutoRedirect.tsx` that:
- Auto-detects user location from LocationContext
- Redirects `/compare` to `/compare?zip=XXXXX` automatically
- Shows loading spinner while detecting
- Falls back to manual ZIP search if no location

### 4. Satellite Provider Deprioritization
Modified `/src/app/compare/page.tsx` `getProvidersByZip()` function:
- Wired providers (Fiber, Cable, DSL) now appear first
- Satellite providers (Viasat, EchoStar, Starlink, HughesNet) appear last
- Within each category, sorted by coverage percentage

---

## Key Files Reference

### Core Components
- `/src/components/ChatWindow.tsx` - Main chat interface
- `/src/components/PageChatSection.tsx` - Chat section on non-homepage pages
- `/src/components/FloatingChatButton.tsx` - Floating chat button
- `/src/components/CompareAutoRedirect.tsx` - Auto-redirect for compare page
- `/src/components/ZipSearch.tsx` - ZIP code search form

### Contexts
- `/src/contexts/ChatContext.tsx` - Chat state management
- `/src/contexts/LocationContext.tsx` - User location (ZIP, city, etc.)

### Visual Effects
- `/src/app/globals.css` - All custom CSS classes including:
  - `.futuristic-card` - Card styling with hover effects
  - `.gradient-text-*` - Text gradient classes
  - `.glow-burst-*` - Hover glow effects
  - `.corner-accent` - Corner decorations on cards
- `/src/components/effects/ParticleBackground.tsx` - Animated particles
- `/src/components/effects/AuroraBlobs.tsx` - Background blobs

### Pages
- `/src/app/page.tsx` - Homepage (client component)
- `/src/app/compare/page.tsx` - Compare by ZIP (server component)
- `/src/app/providers/[slug]/page.tsx` - Provider detail page

---

## Database Tables (Supabase)

- `providers` - Provider info (name, slug, technologies)
- `provider_plans` - Internet plans with pricing
- `provider_promotions` - Current deals/promotions
- `zip_broadband_coverage` - FCC coverage data by ZIP
- `zip_cbsa_mapping` - ZIP to CBSA code mapping
- `cbsa_providers` - Providers by CBSA with coverage %
- `fcc_providers` - FCC provider names

---

## Commands

```bash
# Development
cd "/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs"
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel --prod --yes

# Git
git add -A && git commit -m "message" && git push
```

---

## Environment Variables

Located in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

---

## Current State

- All visual enhancements applied and deployed
- Mobile responsiveness improved
- Compare page auto-redirects with location
- Satellite providers deprioritized
- Site is live at https://internetproviders-nextjs.vercel.app

---

## Potential Future Tasks

1. Further mobile testing on actual devices
2. Performance optimization (if needed)
3. Additional provider data enrichment
4. SEO improvements
5. Analytics integration

---

## To Resume This Conversation

Tell Claude:
> "I'm working on the InternetProviders.ai NextJS project at `/Users/groiv/Python Sandbox/Internet Provders AI 1/internetproviders-nextjs`. Read the CONVERSATION_RESUME.md file in the project root for context on recent changes."
