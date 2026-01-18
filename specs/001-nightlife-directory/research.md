# Research: Thailand Nightlife Directory

**Branch**: `001-nightlife-directory` | **Date**: 2026-01-17

## Technology Decisions

### 1. Frontend Framework: Next.js 14+ (App Router)

**Decision**: Use Next.js 14+ with App Router

**Rationale**:
- Built-in SSR/SSG support critical for SEO (Constitution Principle I)
- App Router provides better layouts, loading states, and streaming
- Native sitemap.ts support for dynamic sitemap generation
- Excellent TypeScript support (strict mode)
- Image optimization built-in (next/image)
- Vercel/Cloudflare Pages deployment ready

**Alternatives Considered**:
- Remix: Good SSR but smaller ecosystem, less familiar
- Astro: Great for static but complex for dynamic admin panel
- Nuxt: Vue-based, team has more React experience

### 2. Backend Framework: .NET 8 Minimal API

**Decision**: Use .NET 8 Minimal API with FastEndpoints pattern

**Rationale**:
- Minimal API provides lightweight, fast endpoints
- FastEndpoints pattern organizes endpoints cleanly
- EF Core 8 has excellent PostgreSQL support
- Built-in JWT authentication
- Cross-platform deployment (Azure, Render, Fly.io)
- Strong typing reduces runtime errors

**Alternatives Considered**:
- Node.js/Express: Familiar but lacks strong typing benefits
- Go/Fiber: Fast but steeper learning curve
- FastAPI (Python): Good but different ecosystem

### 3. Database: PostgreSQL 15+

**Decision**: Use PostgreSQL with PostGIS extension (optional for geospatial)

**Rationale**:
- Robust, production-ready RDBMS
- Full-text search for Thai language (with proper collation)
- Native JSON support for flexible fields (facilities, operating hours)
- PostGIS available if advanced geospatial queries needed
- Excellent EF Core support

**Alternatives Considered**:
- MySQL: Less feature-rich for JSON and full-text search
- MongoDB: Overkill for structured data, complicates relationships
- SQLite: Not suitable for production multi-user

### 4. Image Storage: Cloudflare R2

**Decision**: Use Cloudflare R2 (S3-compatible)

**Rationale**:
- Zero egress fees (significant cost savings)
- S3-compatible API (easy migration)
- Global edge caching
- Works well with Cloudflare Pages if chosen
- Supports signed URLs for admin uploads

**Alternatives Considered**:
- AWS S3: Higher egress costs
- Azure Blob: Good but more complex
- Supabase Storage: Simpler but less control

### 5. Styling: Tailwind CSS

**Decision**: Tailwind CSS with custom theme config

**Rationale**:
- Utility-first approach matches Constitution CI requirements
- Easy to enforce exact color palette (Principle II)
- Built-in dark mode support
- Excellent Next.js integration
- Responsive utilities for mobile-first design

**Alternatives Considered**:
- Styled Components: Runtime overhead
- CSS Modules: More boilerplate
- Chakra UI: Harder to customize to exact CI

### 6. State Management & Data Fetching

**Decision**: React Query (TanStack Query) for server state

**Rationale**:
- Automatic caching, deduplication, and revalidation
- Works well with Next.js Server Components
- Built-in loading/error states
- Optimistic updates for admin panel

**Alternatives Considered**:
- SWR: Simpler but less features
- Redux Toolkit Query: Overkill for this project
- Zustand: Better for client state, not server state

### 7. Authentication: JWT Bearer Tokens

**Decision**: JWT for Admin authentication only

**Rationale**:
- Stateless authentication
- Works across frontend and API
- Simple implementation for admin-only access
- No need for complex OAuth (no public user login)

**Implementation**:
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry, stored in httpOnly cookie
- Admin credentials stored in database (hashed with BCrypt)

### 8. SEO & Structured Data

**Decision**: Next.js Metadata API + JSON-LD for Schema.org

**Rationale**:
- Metadata API generates meta tags server-side
- JSON-LD format preferred by Google
- LocalBusiness schema for store pages
- BreadcrumbList for navigation

**Implementation**:
- Dynamic generateMetadata() in page components
- Shared schema generators in lib/schema.ts
- Sitemap generated via sitemap.ts route

### 9. Analytics Integration

**Decision**: Google Tag Manager + GA4

**Rationale**:
- GTM allows flexible event configuration
- GA4 provides comprehensive analytics
- Environment-based GTM container IDs
- Constitution-required events easily implemented

**Required Events** (from Constitution):
- `view_store`
- `click_call`
- `click_line`
- `click_map`
- `search`
- `filter_type`
- `filter_province`

### 10. Ad Tracking System

**Decision**: Internal tracking with PostgreSQL + batch inserts

**Rationale**:
- Simple table for impressions/clicks
- Batch insert for high-volume impressions
- Easy reporting queries
- No external ad platform needed

**Implementation**:
- AdMetric table: ad_id, event_type (impression/click), timestamp, page_context
- Beacon endpoint for client-side tracking
- Batch writes with configurable flush interval

## Technical Patterns

### API Design Pattern

```
Endpoint Structure:
- GET    /api/stores              # List stores (with filters)
- GET    /api/stores/{slug}       # Get store by slug
- GET    /api/provinces           # List provinces
- GET    /api/provinces/{slug}    # Get province with stores
- GET    /api/categories          # List categories
- GET    /api/categories/{slug}   # Get category with stores
- GET    /api/ads                 # Get active ads (with targeting)
- POST   /api/ads/track           # Track impression/click
- POST   /api/contact             # Submit contact form

Admin Endpoints (JWT protected):
- POST   /api/admin/auth/login    # Login
- POST   /api/admin/auth/refresh  # Refresh token
- CRUD   /api/admin/stores/*
- CRUD   /api/admin/provinces/*
- CRUD   /api/admin/categories/*
- CRUD   /api/admin/ads/*
```

### Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Store list | ISR | 5 minutes |
| Store detail | ISR | 10 minutes |
| Province page | ISR | 10 minutes |
| Category page | ISR | 10 minutes |
| Provinces list | Static + API cache | 1 hour |
| Categories list | Static + API cache | 1 hour |
| Ads | No cache | Real-time |

### Image Optimization

- Logo: 200x200, WebP, quality 80
- Banner: 1200x400, WebP, quality 80
- Gallery: 800x600, WebP, quality 80
- Thumbnails: 400x300, WebP, quality 75
- Use next/image for automatic optimization
- Lazy loading for gallery images

### Nearby Stores Algorithm

```
Haversine formula with PostgreSQL:
- Calculate distance on API side
- Radius: 5km (configurable)
- Limit: 6 stores
- Exclude current store
- Only active stores
```

## Resolved Clarifications

All technical context items have been resolved with the user's input:
- ✅ Frontend: Next.js (TypeScript, App Router)
- ✅ Backend: .NET 8 Minimal API
- ✅ Database: PostgreSQL
- ✅ Image Storage: Cloudflare R2
- ✅ Hosting: Vercel/Cloudflare + Azure/Render/Fly.io
- ✅ SEO: sitemap.xml, robots.txt, schema.org
- ✅ Analytics: GTM + GA4
- ✅ Ads: Internal system with impression/click tracking

## Outstanding Items

None - all technical decisions resolved.

## Next Steps

1. Generate data-model.md (Phase 1)
2. Generate API contracts (Phase 1)
3. Generate quickstart.md (Phase 1)
4. Generate tasks.md (/speckit.tasks command)
