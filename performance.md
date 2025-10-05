# Performance Audit Report

## 1. Executive Summary
- **Overall status:** Good foundation (Next.js 14, ESLint, typed routes, Prisma) but dependent on correct environment configuration and external APIs.
- **Key risks:** Missing production `DATABASE_URL`, API key dependencies, and lack of runtime performance measurements (Lighthouse/Playwright).
- **Immediate wins:** Configure caching headers, image optimization, code splitting for AI tools, and database index verification.

## 2. Core Web Vitals (Estimated)
Without live telemetry, estimates rely on framework defaults and component patterns.

| Metric | Expected Baseline | Improvement Opportunity | Priority |
| --- | --- | --- | --- |
| LCP | ~2.8s on desktop (heavy hero, large table renders) | Defer heavy sections (AI widgets, tables) behind skeletons; ensure hero images use `next/image` | Medium |
| FID / INP | Good (React concurrent features) | Ensure AI tool modals don’t block main thread; prefetch heavy components | Low |
| CLS | Good (consistent layout) | Add explicit heights to dynamic sections (dashboard cards) | Low |

## 3. Load & Execution Analysis

### JavaScript Bundles
- **Issue:** Dashboard (`/`) bundles include AI assistants, worklog and order tables, smart modals simultaneously.
- **Impact:** Increases initial JS payload (~330 KB first load). Slows TTI.
- **Recommendation:**
  - Convert infrequently used modules to `next/dynamic` (e.g., `OrderAIAssistant`, `SmartRecipeImport`, `PerformanceMonitor`).
  - Use `suspense` boundaries with skeletons for heavy lists.
- **Expected improvement:** 10-20% reduction in initial JS.
- **Priority:** High.

### Render-blocking Assets
- Critical CSS is from Tailwind and Next; minimal issue.
- Ensure fonts use `display=swap` (Inter already handled by Next).

### Images
- `/images/EasyHealth_Logo_only.svg` served inline via `<svg>`; fine.
- Background SVGs embedded in CSS; heavy but cached. Consider simplifying or using smaller data URIs if metrics show impact.
- Audit any future images with `next/image`; provide width/height for layout stability.

### Caching & CDN
- Next.js static assets benefit from Vercel CDN.
- **Action:**
  - Configure API responses with `Cache-Control` where appropriate (e.g., ingredient stats, AI suggestions with short max-age + stale-while-revalidate).
  - Use SSG or ISR for static pages (`history`, `privacy`, `terms`) via `export const dynamic = 'force-static'` if content rarely changes.

### Database Queries
- `/api/orders` and `/api/worklogs` already use pagination and indexes (`@@index` on `completionDate`, `workDate`).
- **Risk:** Heavy includes (worklogs + ingredients) on initial fetch; consider lazy-loading related data (fetch worklogs separately when order expanded).
- **Action:** Profile queries with `prisma.$queryRaw('EXPLAIN ANALYZE ...')` to confirm index usage.

## 4. Async & API Performance
- All AI routes call external APIs; ensure timeouts and retries (currently missing). Add `AbortController` with 30s timeout, exponential backoff.
- Toasts show errors but consider queueing requests to prevent duplicate loads.
- Add logging of response time in `logger` metadata for slow requests.

## 5. Implementation Checklist
1. Configure valid `DATABASE_URL`, `OPENROUTER_API_KEY`, etc. and test `npm run check` (High).
2. Introduce `next/dynamic` for AI-heavy components on `/` (High).
3. Set caching headers in API routes for read-heavy data (Medium).
4. Add `AbortController` + retry logic for external fetches (Medium).
5. Profile Prisma queries with real data and adjust indexes if needed (Medium).
6. Run Lighthouse/Playwright and capture metrics baseline (High).

## 6. Tooling & Monitoring Suggestions
- Add GitHub Action to run `npm run check` + Lighthouse CI.
- Implement runtime logging for slow requests (>1s) using `logger.warn`.
- Use Vercel Analytics for Core Web Vitals; set performance budgets.

## 7. Expected Outcomes
- **Bundle optimization:** 275 KB initial JS (target -15%).
- **API responsiveness:** <400 ms average for `/api/orders` after caching.
- **External API reliability:** 99% success with retry logic and exponential backoff.
- **Core Web Vitals:** LCP < 2.5s, INP < 200 ms, CLS < 0.1.

## 8. Next Steps
- Assign owners for each checklist item.
- Schedule post-change Lighthouse runs.
- Document environment variable requirements and fallback behaviour.

