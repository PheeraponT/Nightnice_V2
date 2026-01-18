# Implementation Plan: Thailand Nightlife Directory

**Branch**: `001-nightlife-directory` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-nightlife-directory/spec.md`

## Summary

Web Application สำหรับแสดงร้านอาหารและสถานที่เที่ยวกลางคืนในประเทศไทย ประกอบด้วย:
- **Public Web**: Next.js (SSR/SSG) สำหรับ SEO-optimized pages (Home, Province Landing, Category Landing, Store Detail, Advertise)
- **Admin Panel**: Next.js Admin UI สำหรับจัดการร้าน จังหวัด ประเภทร้าน และโฆษณา
- **API Backend**: .NET 8 Minimal API พร้อม JWT Auth สำหรับ Admin
- **Database**: PostgreSQL พร้อม seed data 77 จังหวัด + 4 ประเภทร้าน

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x (strict mode), Next.js 14+ (App Router)
- Backend: C# 12, .NET 8

**Primary Dependencies**:
- Frontend: Next.js, Tailwind CSS, React Query/SWR
- Backend: .NET 8 Minimal API or FastEndpoints, Entity Framework Core, JWT Bearer Auth

**Storage**:
- Database: PostgreSQL 15+
- Images: Cloudflare R2 (S3-compatible)

**Testing**:
- Frontend: Jest, React Testing Library, Playwright (E2E)
- Backend: xUnit, NSubstitute

**Target Platform**:
- Web: Vercel or Cloudflare Pages (Frontend)
- API: Azure App Service / Render / Fly.io (Backend)

**Project Type**: Web (frontend + backend)

**Performance Goals**:
- Page load: < 2 seconds (LCP)
- API response: < 200ms p95
- Support 10,000+ stores without performance degradation

**Constraints**:
- All public pages must be SSR/SSG for SEO
- Mobile-first responsive design
- Thai language only (single locale)

**Scale/Scope**:
- 77 provinces, 4+ categories
- 10,000+ stores target
- Internal ad system (Banner, Sponsored, Featured)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. SEO-First Architecture (NON-NEGOTIABLE)
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| SSR/SSG for public pages | ✅ PASS | Next.js App Router with SSG/ISR |
| SEO-friendly URLs | ✅ PASS | `/province/{slug}`, `/category/{slug}`, `/store/{slug}` |
| Title, meta description | ✅ PASS | Dynamic metadata per page |
| Canonical URLs | ✅ PASS | Next.js built-in support |
| Structured Data | ✅ PASS | LocalBusiness schema |
| sitemap.xml, robots.txt | ✅ PASS | Auto-generated |

### II. Dark Modern Nightlife Design (NON-NEGOTIABLE)
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Color palette compliance | ✅ PASS | Tailwind config with exact hex values |
| Gradient buttons | ✅ PASS | `#EB1046` → `#6729FF` |
| Border radius 12-16px | ✅ PASS | Tailwind custom config |
| WCAG AA contrast | ✅ PASS | Verified color combinations |

### III. Clean Architecture
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Frontend no direct DB | ✅ PASS | API layer separation |
| API single data access | ✅ PASS | .NET API only |
| Business logic in Service | ✅ PASS | Service layer pattern |
| Repository pattern | ✅ PASS | EF Core repositories |
| No circular dependencies | ✅ PASS | Layer separation enforced |

### IV. Performance & Scale
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Page load < 3s on 3G | ✅ PASS | SSG + CDN |
| LCP < 2.5s | ✅ PASS | Image optimization |
| FID < 100ms | ✅ PASS | Minimal JS hydration |
| CLS < 0.1 | ✅ PASS | Reserved image placeholders |
| Lazy loading images | ✅ PASS | Next.js Image component |
| API caching | ✅ PASS | Response caching + ISR |

### V. Analytics & Tracking Standards
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| GA4 via GTM | ✅ PASS | GTM integration |
| Required events | ✅ PASS | All events mapped |
| No hardcoded IDs | ✅ PASS | Environment variables |

### VI. Advertising System Standards
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Sponsored label | ✅ PASS | Clear "โฆษณา" badge |
| Non-intrusive placement | ✅ PASS | Dedicated ad slots |
| Internal ad support | ✅ PASS | Banner/Sponsored/Featured |
| Extensible | ✅ PASS | Ad type enum |
| Trackable | ✅ PASS | Impression/click tracking |

### VII. Code Quality Standards
| Requirement | Compliance | Notes |
|-------------|------------|-------|
| Input validation | ✅ PASS | FluentValidation |
| Error handling | ✅ PASS | Global error middleware |
| Descriptive names | ✅ PASS | Enforced via review |
| No magic numbers | ✅ PASS | Constants/enums |
| No TypeScript errors | ✅ PASS | Strict mode enabled |

**Gate Status**: ✅ ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-nightlife-directory/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
│   └── api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Web Application Structure

backend/
├── src/
│   └── Nightnice.Api/
│       ├── Program.cs                    # Minimal API entry point
│       ├── Endpoints/                    # API endpoints (grouped)
│       │   ├── StoreEndpoints.cs
│       │   ├── ProvinceEndpoints.cs
│       │   ├── CategoryEndpoints.cs
│       │   ├── AdvertisementEndpoints.cs
│       │   ├── ContactEndpoints.cs
│       │   └── AdminEndpoints.cs
│       ├── Services/                     # Business logic
│       │   ├── StoreService.cs
│       │   ├── SearchService.cs
│       │   ├── AdService.cs
│       │   └── ImageService.cs
│       ├── Data/                         # Data access
│       │   ├── NightniceDbContext.cs
│       │   ├── Repositories/
│       │   └── Migrations/
│       ├── Models/                       # Domain models
│       │   ├── Store.cs
│       │   ├── Province.cs
│       │   ├── Category.cs
│       │   ├── Advertisement.cs
│       │   └── ...
│       ├── DTOs/                         # Data transfer objects
│       ├── Auth/                         # JWT authentication
│       └── Middleware/                   # Error handling, logging
└── tests/
    └── Nightnice.Api.Tests/
        ├── Unit/
        └── Integration/

frontend/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (public)/                     # Public pages group
│   │   │   ├── page.tsx                  # Home
│   │   │   ├── province/[slug]/page.tsx  # Province landing
│   │   │   ├── category/[slug]/page.tsx  # Category landing
│   │   │   ├── store/[slug]/page.tsx     # Store detail
│   │   │   └── advertise/page.tsx        # Advertise page
│   │   ├── admin/                        # Admin pages (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── stores/page.tsx
│   │   │   ├── provinces/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── ads/page.tsx
│   │   ├── api/                          # API routes (if needed)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── sitemap.ts                    # Dynamic sitemap
│   ├── components/
│   │   ├── ui/                           # Base UI components
│   │   ├── store/                        # Store-related components
│   │   ├── search/                       # Search components
│   │   ├── ads/                          # Ad components
│   │   └── admin/                        # Admin components
│   ├── lib/                              # Utilities
│   │   ├── api.ts                        # API client
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/                            # Custom React hooks
│   └── types/                            # TypeScript types
├── public/
│   ├── robots.txt
│   └── images/
├── tailwind.config.ts                    # CI colors
├── next.config.ts
└── tests/
    ├── e2e/                              # Playwright tests
    └── unit/                             # Jest tests
```

**Structure Decision**: Web application with separated frontend (Next.js) and backend (.NET 8 API). Frontend handles SSR/SSG for SEO, backend provides REST API for all data operations.

## Complexity Tracking

> No violations - all Constitution gates passed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
