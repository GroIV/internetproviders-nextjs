# Pre-Launch Checklist

## Security (CRITICAL)

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [ ] | **HIGH** | Admin API has no authentication | `api/admin/updates/route.ts` | Add JWT/session verification or API key check before allowing POST/PATCH |
| [ ] | **HIGH** | SQL execution risk | `api/admin/updates/[id]/route.ts` | The `sql_to_execute` field could allow injection if ever executed - add strict validation |
| [x] | Done | Rate limiting | `src/lib/ratelimit.ts` | Upstash rate limiting on chat API (20 req/60s per IP) |
| [x] | Done | Security headers | `next.config.ts` | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection |
| [x] | Done | Input validation | `lib/validation/schemas.ts` | Zod schemas for all API endpoints |

## Error Handling (HIGH)

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | 404 page | `src/app/not-found.tsx` | Custom 404 with navigation back to home |
| [x] | Done | Error page | `src/app/error.tsx` | Error boundary page with Sentry integration |
| [x] | Done | Global error page | `src/app/global-error.tsx` | Fallback for root layout errors |
| [x] | Done | Error boundaries | `components/ErrorBoundary.tsx` | Component-level crash isolation |

## Performance

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | Code splitting | `components/AppShell.tsx` | Dynamic imports for heavy components |
| [x] | Done | Web Vitals monitoring | `components/WebVitals.tsx` | Tracking LCP, CLS, INP, FCP, TTFB |
| [x] | Done | PWA support | `public/manifest.json` | Service worker and app manifest |

## Monitoring

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | Error tracking | Sentry | Full integration with source maps |
| [ ] | Low | Analytics | - | Consider Google Analytics or Plausible for traffic insights |

## Testing

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | Basic test suite | `src/__tests__/` | Jest + React Testing Library |
| [x] | Done | E2E tests | `e2e/` | Playwright tests for homepage, providers, search, tools, legal, 404 |
| [ ] | Low | API integration tests | - | Test all API endpoints with supertest or similar |

## SEO & Content

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | Sitemap | `src/app/sitemap.ts` | Dynamic sitemap generation |
| [x] | Done | robots.txt | `public/robots.txt` | Search engine directives |
| [x] | Done | Meta tags | Various layouts | OpenGraph and Twitter cards |
| [x] | Done | Privacy Policy | `src/app/privacy/page.tsx` | Legal page present |
| [x] | Done | Terms of Service | `src/app/terms/page.tsx` | Legal page present |

## Infrastructure

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [ ] | Medium | No .env.example | Root | Create template for required environment variables |
| [ ] | Low | Missing PWA icons | `public/icons/` | Add icon-48x48.png, icon-72x72.png, icon-96x96.png |
| [x] | Done | Vercel deployment | - | Production deployment configured |
| [x] | Done | Supabase database | - | Production database configured |

## Accessibility

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | ARIA labels | Various components | Icon buttons and interactive elements labeled |
| [x] | Done | Focus management | `FloatingChatButton.tsx` | Focus trap in modals |
| [x] | Done | Alt text | Image components | All images have descriptive alt text |
| [x] | Done | Keyboard navigation | Various | Tab navigation and escape key handlers |

## Code Quality

| Status | Priority | Issue | Location | Action |
|--------|----------|-------|----------|--------|
| [x] | Done | API response consistency | All API routes | Standardized `{ success, data?, error? }` pattern |
| [x] | Done | TypeScript strict mode | Various | Replaced `any` types with proper interfaces |
| [x] | Done | ESLint compliance | Various | Documented remaining legitimate suppressions |

---

## Quick Start Priorities

### Before Going Live (Must Have):
1. **Add admin authentication** - Protect `/api/admin/*` routes

### Soon After Launch (Should Have):
2. Create `.env.example` for team documentation
3. ~~Set up Upstash Redis for production rate limiting~~ **DONE** - Add vars to Vercel!

### Nice to Have:
4. Google Analytics integration
5. Complete PWA icon set (48x48, 72x72, 96x96)
6. API integration tests

---

**Legend:**
- `[x]` = Completed
- `[ ]` = Pending

**Last Updated:** 2026-01-01

---

## Setup Notes

### Rate Limiting
Rate limiting is implemented but requires Upstash Redis to be configured:
1. Create a free account at https://upstash.com
2. Create a Redis database
3. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

Without these env vars, rate limiting will be disabled (with a console warning).

### E2E Tests
Run E2E tests with:
```bash
npm run test:e2e        # Headless
npm run test:e2e:headed # With browser UI
npm run test:e2e:ui     # Interactive UI mode
```
