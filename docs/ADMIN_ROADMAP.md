# Admin Dashboard Roadmap

This document tracks planned features for the admin dashboard at `/admin`.

## Implemented Features

- [x] **Overview Dashboard** - Quick stats overview
- [x] **API Usage** - Token usage, costs, model distribution
- [x] **Chat Logs** - View AI conversations, ZIP codes, message stats
- [x] **Providers** - List providers with Supabase edit links
- [x] **Errors** - Sentry error feed integration
- [x] **Updates** - Provider update scheduling
- [x] **Chat Analytics** - Session tracking, popular questions, provider analysis, CSV export
- [x] **Affiliate Performance** - Click tracking, revenue estimates, provider performance
- [x] **Database Stats** - Table row counts, storage estimates, recent activity

---

## High Priority

### Provider Management
- [ ] Inline editing of provider info
- [ ] Bulk plan price updates
- [ ] Provider coverage map visualization
- [ ] Missing plan alerts

### SEO Dashboard
- [ ] Track indexed pages via Google Search Console API
- [ ] Crawl error monitoring
- [ ] Top performing pages by traffic
- [ ] Broken link checker

---

## Medium Priority

### Content Management
- [ ] Guide editor with markdown preview
- [ ] Scheduled publishing
- [ ] SEO metadata editor
- [ ] Image upload/optimization

### Coverage Data Tools
- [ ] FCC data import wizard
- [ ] Coverage gap analysis
- [ ] ZIP code lookup tool
- [ ] Bulk coverage updates

### Cache Management
- [x] View cached responses
- [x] Manual cache invalidation
- [ ] Cache hit rate analytics
- [ ] Response time monitoring

---

## Nice to Have

### Database Stats
- [ ] Table row counts
- [ ] Storage usage
- [ ] Query performance metrics
- [ ] Index health

### Deployment History
- [ ] Recent Vercel deploys
- [ ] Build status
- [ ] Rollback capabilities
- [ ] Environment variable management

### Contact Submissions
- [ ] View contact form messages
- [ ] Mark as handled
- [ ] Reply integration
- [ ] Spam filtering

### A/B Testing
- [ ] Create experiments
- [ ] Traffic allocation
- [ ] Results dashboard
- [ ] Statistical significance calculator

### Page View Tracking
- [ ] Add analytics tracking
- [ ] Real-time visitor count
- [ ] Popular pages dashboard
- [ ] Geographic distribution

---

## Technical Debt

- [x] Add authentication to admin routes
- [x] Rate limiting for admin APIs
- [ ] Audit logging for admin actions
- [ ] Admin role permissions

---

## Environment Variables Needed

```bash
# For Sentry error feed
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# For future Google Search Console integration
GOOGLE_SEARCH_CONSOLE_API_KEY=your_key

# For future analytics
ANALYTICS_API_KEY=your_key
```

---

Last updated: January 2026
