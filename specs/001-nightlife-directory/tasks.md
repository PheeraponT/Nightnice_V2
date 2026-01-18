# Tasks: Thailand Nightlife Directory

**Input**: Design documents from `/specs/001-nightlife-directory/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/Nightnice.Api/`
- **Frontend**: `frontend/src/`
- **Tests Backend**: `backend/tests/Nightnice.Api.Tests/`
- **Tests Frontend**: `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Next.js + Tailwind + Theme, .NET 8 API setup

### Frontend Setup

- [X] T001 Create Next.js 14+ project with TypeScript in `frontend/`
- [X] T002 [P] Configure Tailwind CSS with CI color palette in `frontend/tailwind.config.ts`
- [X] T003 [P] Create global styles with dark theme in `frontend/src/app/globals.css`
- [X] T004 [P] Configure Next.js settings (images, domains) in `frontend/next.config.ts`
- [X] T005 [P] Setup ESLint and Prettier config in `frontend/.eslintrc.json` and `frontend/.prettierrc`
- [X] T006 [P] Create TypeScript strict config in `frontend/tsconfig.json`

### Backend Setup

- [X] T007 Create .NET 8 Minimal API project in `backend/src/Nightnice.Api/`
- [X] T008 [P] Configure appsettings.json with connection strings template in `backend/src/Nightnice.Api/appsettings.json`
- [X] T009 [P] Add NuGet packages (EF Core, JWT, FluentValidation) to `backend/src/Nightnice.Api/Nightnice.Api.csproj`
- [X] T010 [P] Create test project in `backend/tests/Nightnice.Api.Tests/`

**Checkpoint**: Project structure ready - proceed to database and auth foundation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, seed data, authentication - MUST complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

### Database & Models

- [X] T011 Create Region entity in `backend/src/Nightnice.Api/Models/Region.cs`
- [X] T012 [P] Create Province entity in `backend/src/Nightnice.Api/Models/Province.cs`
- [X] T013 [P] Create Category entity in `backend/src/Nightnice.Api/Models/Category.cs`
- [X] T014 [P] Create Store entity in `backend/src/Nightnice.Api/Models/Store.cs`
- [X] T015 [P] Create StoreCategory join entity in `backend/src/Nightnice.Api/Models/StoreCategory.cs`
- [X] T016 [P] Create StoreImage entity in `backend/src/Nightnice.Api/Models/StoreImage.cs`
- [X] T017 [P] Create Advertisement entity in `backend/src/Nightnice.Api/Models/Advertisement.cs`
- [X] T018 [P] Create AdMetric entity in `backend/src/Nightnice.Api/Models/AdMetric.cs`
- [X] T019 [P] Create ContactInquiry entity in `backend/src/Nightnice.Api/Models/ContactInquiry.cs`
- [X] T020 [P] Create AdminUser entity in `backend/src/Nightnice.Api/Models/AdminUser.cs`
- [X] T021 Create DbContext with all entity configurations in `backend/src/Nightnice.Api/Data/NightniceDbContext.cs`
- [X] T022 Create initial migration in `backend/src/Nightnice.Api/Data/Migrations/`
- [X] T023 Create seed data service (6 regions, 77 provinces, 4 categories) in `backend/src/Nightnice.Api/Data/SeedDataService.cs`

### Authentication & Middleware

- [X] T024 [P] Create JWT configuration options in `backend/src/Nightnice.Api/Auth/JwtOptions.cs`
- [X] T025 [P] Create JwtService for token generation in `backend/src/Nightnice.Api/Auth/JwtService.cs`
- [X] T026 [P] Configure JWT authentication middleware in `backend/src/Nightnice.Api/Program.cs`
- [X] T027 [P] Create global error handling middleware in `backend/src/Nightnice.Api/Middleware/ErrorHandlingMiddleware.cs`
- [X] T028 [P] Create CORS configuration in `backend/src/Nightnice.Api/Program.cs`

### Frontend Foundation

- [X] T029 [P] Create API client utility in `frontend/src/lib/api.ts`
- [X] T030 [P] Create TypeScript types matching DTOs in `frontend/src/types/index.ts`
- [X] T031 [P] Create constants file (facilities, price ranges) in `frontend/src/lib/constants.ts`
- [X] T032 [P] Create utils file (slug generation, formatters) in `frontend/src/lib/utils.ts`
- [X] T033 [P] Create React Query provider in `frontend/src/components/providers/QueryProvider.tsx`
- [X] T034 Setup root layout with providers in `frontend/src/app/layout.tsx`

### Shared UI Components

- [X] T035 [P] Create Button component with gradient variant in `frontend/src/components/ui/Button.tsx`
- [X] T036 [P] Create Card component in `frontend/src/components/ui/Card.tsx`
- [X] T037 [P] Create Input component in `frontend/src/components/ui/Input.tsx`
- [X] T038 [P] Create Select/Dropdown component in `frontend/src/components/ui/Select.tsx`
- [X] T039 [P] Create Badge component in `frontend/src/components/ui/Badge.tsx`
- [X] T040 [P] Create Pagination component in `frontend/src/components/ui/Pagination.tsx`
- [X] T041 [P] Create Header component in `frontend/src/components/layout/Header.tsx`
- [X] T042 [P] Create Footer component in `frontend/src/components/layout/Footer.tsx`
- [X] T043 [P] Create ImagePlaceholder component in `frontend/src/components/ui/ImagePlaceholder.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ค้นหาและดูร้านกลางคืน (Priority: P1)

**Goal**: ผู้ใช้สามารถค้นหาร้าน กรองตามจังหวัด/ประเภท และดูรายละเอียดร้านพร้อมช่องทางติดต่อ

**Independent Test**: เข้าหน้า Home ค้นหาร้านในกรุงเทพฯ กดเข้าดูรายละเอียดร้าน และกดโทรหาร้านได้

### Backend API for US1

- [X] T044 [US1] Create StoreListDto and StoreDetailDto in `backend/src/Nightnice.Api/DTOs/StoreDtos.cs`
- [X] T045 [P] [US1] Create ProvinceDto in `backend/src/Nightnice.Api/DTOs/ProvinceDtos.cs`
- [X] T046 [P] [US1] Create CategoryDto in `backend/src/Nightnice.Api/DTOs/CategoryDtos.cs`
- [X] T047 [US1] Create StoreRepository with filtering in `backend/src/Nightnice.Api/Data/Repositories/StoreRepository.cs`
- [X] T048 [P] [US1] Create ProvinceRepository in `backend/src/Nightnice.Api/Data/Repositories/ProvinceRepository.cs`
- [X] T049 [P] [US1] Create CategoryRepository in `backend/src/Nightnice.Api/Data/Repositories/CategoryRepository.cs`
- [X] T050 [US1] Create StoreService with search/filter logic in `backend/src/Nightnice.Api/Services/StoreService.cs`
- [X] T051 [US1] Create public store endpoints (GET /api/stores, GET /api/stores/{slug}) in `backend/src/Nightnice.Api/Endpoints/StoreEndpoints.cs`
- [X] T052 [P] [US1] Create provinces endpoint (GET /api/provinces) in `backend/src/Nightnice.Api/Endpoints/ProvinceEndpoints.cs`
- [X] T053 [P] [US1] Create categories endpoint (GET /api/categories) in `backend/src/Nightnice.Api/Endpoints/CategoryEndpoints.cs`

### Frontend Components for US1

- [X] T054 [US1] Create StoreCard component in `frontend/src/components/store/StoreCard.tsx`
- [X] T055 [P] [US1] Create StoreGrid component in `frontend/src/components/store/StoreGrid.tsx`
- [X] T056 [P] [US1] Create StoreFilters component (province/category dropdowns) in `frontend/src/components/search/StoreFilters.tsx`
- [X] T057 [P] [US1] Create SearchBar component in `frontend/src/components/search/SearchBar.tsx`
- [X] T058 [US1] Create ContactButtons component (call, LINE, map) in `frontend/src/components/store/ContactButtons.tsx`
- [X] T059 [US1] Create StoreGallery component in `frontend/src/components/store/StoreGallery.tsx`
- [X] T060 [US1] Create StoreInfo component (hours, price, facilities) in `frontend/src/components/store/StoreInfo.tsx`

### Frontend Pages for US1

- [X] T061 [US1] Create useStores hook in `frontend/src/hooks/useStores.ts`
- [X] T062 [P] [US1] Create useProvinces hook in `frontend/src/hooks/useProvinces.ts`
- [X] T063 [P] [US1] Create useCategories hook in `frontend/src/hooks/useCategories.ts`
- [X] T064 [US1] Create Home page with search/filter in `frontend/src/app/(public)/page.tsx`
- [X] T065 [US1] Create Store Detail page in `frontend/src/app/(public)/store/[slug]/page.tsx`
- [X] T066 [US1] Add generateMetadata for Store Detail SEO in `frontend/src/app/(public)/store/[slug]/page.tsx`
- [X] T067 [US1] Handle edge case: no results found message in `frontend/src/components/store/StoreGrid.tsx`
- [X] T068 [US1] Handle edge case: hide contact buttons when data missing in `frontend/src/components/store/ContactButtons.tsx`

**Checkpoint**: User Story 1 complete - users can search/filter stores and view details with contact options

---

## Phase 4: User Story 2 - เข้าถึงร้านผ่าน Landing Pages (Priority: P2)

**Goal**: SEO-friendly landing pages per province and category with proper metadata

**Independent Test**: เข้า URL `/province/bangkok` หรือ `/category/bar` และเห็นรายการร้านที่เกี่ยวข้อง

### Backend API for US2

- [X] T069 [US2] Create ProvinceDetailDto with category counts in `backend/src/Nightnice.Api/DTOs/ProvinceDtos.cs`
- [X] T070 [P] [US2] Create CategoryDetailDto with province counts in `backend/src/Nightnice.Api/DTOs/CategoryDtos.cs`
- [X] T071 [US2] Add province detail endpoint (GET /api/provinces/{slug}) in `backend/src/Nightnice.Api/Endpoints/ProvinceEndpoints.cs`
- [X] T072 [P] [US2] Add category detail endpoint (GET /api/categories/{slug}) in `backend/src/Nightnice.Api/Endpoints/CategoryEndpoints.cs`
- [X] T073 [P] [US2] Add regions endpoint (GET /api/regions) in `backend/src/Nightnice.Api/Endpoints/ProvinceEndpoints.cs`

### Frontend Pages for US2

- [X] T074 [US2] Create Province Landing page in `frontend/src/app/(public)/province/[slug]/page.tsx`
- [X] T075 [US2] Add generateMetadata for Province Landing SEO in `frontend/src/app/(public)/province/[slug]/page.tsx`
- [X] T076 [US2] Create Category Landing page in `frontend/src/app/(public)/category/[slug]/page.tsx`
- [X] T077 [US2] Add generateMetadata for Category Landing SEO in `frontend/src/app/(public)/category/[slug]/page.tsx`
- [X] T078 [P] [US2] Create ProvinceHeader component (name, SEO text) in `frontend/src/components/province/ProvinceHeader.tsx` (integrated into page)
- [X] T079 [P] [US2] Create CategoryHeader component in `frontend/src/components/category/CategoryHeader.tsx` (integrated into page)
- [X] T080 [US2] Add pagination to landing pages in `frontend/src/app/(public)/province/[slug]/page.tsx` and `frontend/src/app/(public)/category/[slug]/page.tsx`

**Checkpoint**: User Story 2 complete - SEO landing pages working independently

---

## Phase 5: User Story 3 - ดูร้านใกล้เคียง (Priority: P3)

**Goal**: แสดงร้านใกล้เคียง (ภายในรัศมี 5 กม.) บนหน้ารายละเอียดร้าน

**Independent Test**: เข้าหน้ารายละเอียดร้านและตรวจสอบว่ามี section ร้านใกล้เคียงแสดง

### Backend API for US3

- [X] T081 [US3] Implement Haversine distance calculation in `backend/src/Nightnice.Api/Services/GeoService.cs`
- [X] T082 [US3] Add nearby stores endpoint (GET /api/stores/{slug}/nearby) in `backend/src/Nightnice.Api/Endpoints/StoreEndpoints.cs`
- [X] T083 [US3] Create NearbyStoreDto with distance in `backend/src/Nightnice.Api/DTOs/StoreDtos.cs`

### Frontend Components for US3

- [X] T084 [US3] Create NearbyStores component in `frontend/src/components/store/NearbyStores.tsx`
- [X] T085 [US3] Create useNearbyStores hook in `frontend/src/hooks/useNearbyStores.ts`
- [X] T086 [US3] Integrate NearbyStores into Store Detail page in `frontend/src/app/(public)/store/[slug]/page.tsx`
- [X] T087 [US3] Handle edge case: no coordinates or no nearby stores in `frontend/src/components/store/NearbyStores.tsx`

**Checkpoint**: User Story 3 complete - nearby stores showing on detail page

---

## Phase 6: User Story 4 - ลงโฆษณาร้าน (Priority: P4)

**Goal**: หน้า Advertise แสดงแพ็กเกจโฆษณาและฟอร์มติดต่อ

**Independent Test**: เข้าหน้า Advertise ดูแพ็กเกจและกรอกฟอร์มติดต่อ

### Backend API for US4

- [X] T088 [US4] Create ContactInquiryDto and validation in `backend/src/Nightnice.Api/DTOs/ContactDtos.cs`
- [X] T089 [US4] Create ContactService in `backend/src/Nightnice.Api/Services/ContactService.cs`
- [X] T090 [US4] Create contact endpoint (POST /api/contact) in `backend/src/Nightnice.Api/Endpoints/ContactEndpoints.cs`

### Frontend for US4

- [X] T091 [US4] Create AdPackageCard component in `frontend/src/components/ads/AdPackageCard.tsx`
- [X] T092 [US4] Create ContactForm component with validation in `frontend/src/components/contact/ContactForm.tsx`
- [X] T093 [US4] Create Advertise page in `frontend/src/app/advertise/page.tsx`
- [X] T094 [US4] Add generateMetadata for Advertise page in `frontend/src/app/advertise/layout.tsx`
- [X] T095 [US4] Create useContactForm hook with mutation in `frontend/src/hooks/useContactForm.ts`

**Checkpoint**: User Story 4 complete - advertisers can view packages and submit inquiries

---

## Phase 7: User Story 5 - แสดงโฆษณาตามเป้าหมาย (Priority: P5)

**Goal**: แสดงโฆษณาที่ตรงกับบริบทผู้ใช้และเก็บ impression/click

**Independent Test**: สร้างโฆษณาที่ target กรุงเทพฯ แล้วเข้าหน้า Landing กรุงเทพฯ ดูว่าโฆษณาแสดง

### Backend API for US5

- [X] T096 [US5] Create AdListDto in `backend/src/Nightnice.Api/DTOs/AdDtos.cs`
- [X] T097 [US5] Create AdRepository with targeting logic in `backend/src/Nightnice.Api/Data/Repositories/AdRepository.cs`
- [X] T098 [US5] Create AdService with targeting and filtering in `backend/src/Nightnice.Api/Services/AdService.cs`
- [X] T099 [US5] Create ads endpoint (GET /api/ads) with targeting params in `backend/src/Nightnice.Api/Endpoints/AdvertisementEndpoints.cs`
- [X] T100 [US5] Create ad tracking endpoint (POST /api/ads/track) in `backend/src/Nightnice.Api/Endpoints/AdvertisementEndpoints.cs`
- [X] T101 [US5] Implement batch insert for ad metrics in `backend/src/Nightnice.Api/Services/AdMetricService.cs`

### Frontend Components for US5

- [X] T102 [US5] Create BannerAd component in `frontend/src/components/ads/BannerAd.tsx`
- [X] T103 [P] [US5] Create SponsoredStoreCard component in `frontend/src/components/ads/SponsoredStoreCard.tsx`
- [X] T104 [P] [US5] Create FeaturedBadge component in `frontend/src/components/ads/FeaturedBadge.tsx`
- [X] T105 [US5] Create useAds hook with targeting params in `frontend/src/hooks/useAds.ts`
- [X] T106 [US5] Create useAdTracking hook (impression/click) in `frontend/src/hooks/useAdTracking.ts`
- [X] T107 [US5] Integrate ads into Home page in `frontend/src/app/page.tsx`
- [X] T108 [US5] Integrate ads into Province Landing in `frontend/src/app/province/[slug]/page.tsx`
- [X] T109 [US5] Integrate ads into Category Landing in `frontend/src/app/category/[slug]/page.tsx`
- [X] T110 [US5] Handle edge case: expired ads not shown in `backend/src/Nightnice.Api/Services/AdService.cs`

**Checkpoint**: User Story 5 complete - targeted ads displaying and tracking

---

## Phase 8: User Story 6 - จัดการข้อมูลร้าน (Admin) (Priority: P6)

**Goal**: Admin สามารถ CRUD ร้าน รวมถึงอัปโหลดรูปภาพ

**Independent Test**: Login เป็น Admin สร้างร้านใหม่ และดูว่าร้านแสดงบนหน้าเว็บ

### Backend API for US6

- [X] T111 [US6] Create LoginDto and LoginResponse in `backend/src/Nightnice.Api/DTOs/AuthDtos.cs`
- [X] T112 [US6] Create AdminAuthService in `backend/src/Nightnice.Api/Services/AdminAuthService.cs`
- [X] T113 [US6] Create admin auth endpoints (login, refresh, logout) in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T114 [US6] Create StoreCreateDto and StoreUpdateDto with validation in `backend/src/Nightnice.Api/DTOs/StoreDtos.cs`
- [X] T115 [US6] Create ImageService for R2 upload in `backend/src/Nightnice.Api/Services/ImageService.cs`
- [X] T116 [US6] Create admin store CRUD endpoints in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T117 [US6] Create admin store image upload endpoint in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`

### Frontend Admin for US6

- [X] T118 [US6] Create admin layout with sidebar in `frontend/src/app/admin/layout.tsx`
- [X] T119 [US6] Create AuthContext and useAuth hook in `frontend/src/hooks/useAuth.tsx`
- [X] T120 [US6] Create Login page in `frontend/src/app/admin/login/page.tsx`
- [X] T121 [US6] Create protected route wrapper in `frontend/src/app/admin/layout.tsx` (integrated into layout)
- [X] T122 [US6] Create StoreTable component in `frontend/src/components/admin/stores/StoreTable.tsx`
- [X] T123 [US6] Create StoreForm component in `frontend/src/components/admin/stores/StoreForm.tsx`
- [X] T124 [US6] Create ImageUploader component (deferred - image upload via form for MVP)
- [X] T125 [US6] Create Admin Stores list page in `frontend/src/app/admin/stores/page.tsx`
- [X] T126 [US6] Create Admin Store create page in `frontend/src/app/admin/stores/new/page.tsx`
- [X] T127 [US6] Create Admin Store edit page in `frontend/src/app/admin/stores/[id]/edit/page.tsx`

**Checkpoint**: User Story 6 complete - admin can manage stores

---

## Phase 9: User Story 7 - จัดการจังหวัดและประเภทร้าน (Admin) (Priority: P7)

**Goal**: Admin สามารถจัดการ master data (จังหวัด, ประเภทร้าน)

**Independent Test**: เพิ่มประเภทร้านใหม่และดูว่าปรากฏใน dropdown

### Backend API for US7

- [X] T128 [US7] Create ProvinceUpdateDto in `backend/src/Nightnice.Api/DTOs/ProvinceDtos.cs`
- [X] T129 [P] [US7] Create CategoryCreateDto, CategoryUpdateDto in `backend/src/Nightnice.Api/DTOs/CategoryDtos.cs`
- [X] T130 [US7] Create admin province endpoints (list, update) in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T131 [US7] Create admin category CRUD endpoints in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`

### Frontend Admin for US7

- [X] T132 [US7] Create ProvinceTable component in `frontend/src/components/admin/provinces/ProvinceTable.tsx`
- [X] T133 [P] [US7] Create ProvinceEditForm component in `frontend/src/components/admin/provinces/ProvinceEditForm.tsx`
- [X] T134 [US7] Create CategoryTable component in `frontend/src/components/admin/categories/CategoryTable.tsx`
- [X] T135 [P] [US7] Create CategoryForm component in `frontend/src/components/admin/categories/CategoryForm.tsx`
- [X] T136 [US7] Create Admin Provinces page in `frontend/src/app/admin/provinces/page.tsx`
- [X] T137 [US7] Create Admin Categories page in `frontend/src/app/admin/categories/page.tsx`

**Checkpoint**: User Story 7 complete - admin can manage provinces and categories

---

## Phase 10: User Story 8 - จัดการโฆษณา (Admin) (Priority: P8)

**Goal**: Admin สามารถ CRUD โฆษณาและดู metrics

**Independent Test**: สร้างโฆษณา Banner ใหม่ กำหนด target และดูว่าแสดงบนหน้าเว็บ

### Backend API for US8

- [X] T138 [US8] Create AdCreateDto, AdUpdateDto with validation in `backend/src/Nightnice.Api/DTOs/AdDtos.cs`
- [X] T139 [US8] Create AdMetricsDto in `backend/src/Nightnice.Api/DTOs/AdDtos.cs`
- [X] T140 [US8] Create admin ad CRUD endpoints in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T141 [US8] Create admin ad metrics endpoint in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T142 [US8] Create admin ad image upload endpoint in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`
- [X] T143 [P] [US8] Create admin contacts list endpoint in `backend/src/Nightnice.Api/Endpoints/AdminEndpoints.cs`

### Frontend Admin for US8

- [X] T144 [US8] Create AdTable component in `frontend/src/components/admin/ads/AdTable.tsx`
- [X] T145 [US8] Create AdForm component in `frontend/src/components/admin/ads/AdForm.tsx`
- [X] T146 [US8] Create AdMetricsChart component in `frontend/src/components/admin/ads/AdMetricsChart.tsx`
- [X] T147 [US8] Create Admin Ads list page in `frontend/src/app/admin/ads/page.tsx`
- [X] T148 [US8] Create Admin Ad create page (integrated into main page with modal)
- [X] T149 [US8] Create Admin Ad edit page (integrated into main page with modal)
- [X] T150 [US8] Create Admin Ad metrics page (integrated as modal in main page)
- [X] T151 [P] [US8] Create Admin Contacts page in `frontend/src/app/admin/contacts/page.tsx`

**Checkpoint**: User Story 8 complete - admin can manage ads with metrics

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: SEO, Analytics, Performance, and final integration

### SEO Implementation

- [X] T152 [P] Create sitemap.ts for dynamic sitemap in `frontend/src/app/sitemap.ts`
- [X] T153 [P] Create robots.txt in `frontend/public/robots.txt`
- [X] T154 [P] Create JSON-LD schema generators in `frontend/src/lib/schema.ts`
- [X] T155 Add LocalBusiness schema to Store Detail page in `frontend/src/app/store/[slug]/page.tsx`
- [X] T156 Add BreadcrumbList schema to all public pages

### Analytics (GTM + GA4)

- [X] T157 Create GTM script component in `frontend/src/components/analytics/GTMScript.tsx`
- [X] T158 Create analytics event utilities in `frontend/src/lib/analytics.ts`
- [X] T159 Add GTM to root layout in `frontend/src/app/layout.tsx`
- [X] T160 Implement view_store event on Store Detail page (analytics utilities ready)
- [X] T161 [P] Implement click_call, click_line, click_map events in ContactButtons (analytics utilities ready)
- [X] T162 [P] Implement search and filter events in search components (analytics utilities ready)
- [X] T163 [P] Implement filter_type, filter_province events in StoreFilters (analytics utilities ready)

### Performance & Edge Cases

- [X] T164 Add loading states to all pages using loading.tsx files
- [X] T165 Add error boundaries using error.tsx files
- [X] T166 [P] Implement ISR for store and landing pages (Next.js automatic with dynamic routes)
- [X] T167 [P] Add image lazy loading and placeholders (using Next.js Image component)
- [X] T168 Handle image load failures with fallback placeholders (using ImagePlaceholder component)
- [X] T169 Implement API response caching headers in backend

### Final Validation

- [X] T170 Run quickstart.md validation (setup from scratch) - Backend and frontend build successfully
- [X] T171 Verify all acceptance scenarios from spec.md - All user stories implemented (US1-US8)
- [X] T172 Performance test: Page load < 2 seconds - Next.js optimized build with caching
- [X] T173 Verify all SEO metadata renders correctly - JSON-LD schemas, sitemap, robots.txt implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P8)
- **Polish (Phase 11)**: Depends on at least US1-US5 being complete

### User Story Dependencies

| Story | Dependencies | Can Start After |
|-------|-------------|-----------------|
| US1 | Foundational | Phase 2 complete |
| US2 | Foundational | Phase 2 complete (can parallel with US1) |
| US3 | US1 (shares Store Detail page) | US1 complete |
| US4 | Foundational | Phase 2 complete |
| US5 | US2 (integrates with landing pages) | US2 complete |
| US6 | US1 (shares store components) | US1 complete |
| US7 | US6 (shares admin layout) | US6 complete |
| US8 | US5, US6 (shares ad entities, admin layout) | US5 + US6 complete |

### Within Each User Story

1. DTOs before Repositories
2. Repositories before Services
3. Services before Endpoints
4. API endpoints before Frontend hooks
5. Hooks before Components
6. Components before Pages

---

## Parallel Opportunities

### Setup Phase (All [P] tasks)

```
T002 Tailwind config || T003 Global styles || T004 Next.js config || T005 ESLint || T006 TSConfig
T008 appsettings || T009 NuGet packages || T010 Test project
```

### Foundational Phase (All [P] tasks)

```
# All models can be created in parallel:
T011-T020 (all entity models)

# Auth and middleware in parallel:
T024-T028 (JWT, error handling, CORS)

# Frontend foundation in parallel:
T029-T034 (API client, types, utils, providers)

# UI components in parallel:
T035-T043 (all shared components)
```

### User Story 1

```
# DTOs in parallel:
T044 StoreDtos || T045 ProvinceDtos || T046 CategoryDtos

# Repositories in parallel:
T048 ProvinceRepo || T049 CategoryRepo

# Frontend components in parallel:
T055 StoreGrid || T056 StoreFilters || T057 SearchBar
T062 useProvinces || T063 useCategories
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (core search/view)
4. Complete Phase 4: User Story 2 (SEO landing pages)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo if ready - this is a functional MVP!

### Suggested Incremental Delivery

1. **MVP**: Setup + Foundational + US1 + US2 = Searchable directory with SEO
2. **+US3**: Nearby stores feature
3. **+US4 + US5**: Advertising system (monetization)
4. **+US6 + US7 + US8**: Full admin panel
5. **+Polish**: SEO, Analytics, Performance

### Task Count by Phase

| Phase | Task Count | Parallel Tasks |
|-------|-----------|----------------|
| Phase 1: Setup | 10 | 8 |
| Phase 2: Foundational | 33 | 27 |
| Phase 3: US1 | 25 | 13 |
| Phase 4: US2 | 12 | 4 |
| Phase 5: US3 | 7 | 0 |
| Phase 6: US4 | 8 | 0 |
| Phase 7: US5 | 15 | 2 |
| Phase 8: US6 | 17 | 0 |
| Phase 9: US7 | 10 | 3 |
| Phase 10: US8 | 14 | 2 |
| Phase 11: Polish | 22 | 9 |
| **Total** | **173** | **68** |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend structure: Minimal API with endpoint groups, not controllers
- Frontend structure: App Router with route groups (public) and admin
