<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: N/A → 1.0.0 (Initial Constitution)
Bump Rationale: MAJOR - Initial ratification of project constitution

Modified Principles: N/A (Initial creation)

Added Sections:
  - Core Principles (7 principles)
  - Technology Stack Standards
  - SEO & Content Standards
  - Governance

Removed Sections: N/A (Initial creation)

Templates Status:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Requirements section aligns)
  - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports principles)
  - .specify/templates/checklist-template.md: ✅ Compatible (Generic checklist structure)
  - .specify/templates/agent-file-template.md: ✅ Compatible (Generic agent template)

Deferred Items: None
=============================================================================
-->

# Nightnice Web Constitution

## Core Principles

### I. SEO-First Architecture (NON-NEGOTIABLE)

ทุก Public Page ต้องถูกออกแบบโดยคำนึงถึง SEO เป็นอันดับแรก

**Rules:**
- ทุกหน้า Public MUST รองรับ SSR (Server-Side Rendering) หรือ SSG (Static Site Generation)
- URL MUST เป็น SEO-friendly format (human-readable, lowercase, hyphen-separated)
- ทุกหน้า MUST มี:
  - `<title>` และ `<meta name="description">` ที่ unique และ relevant
  - Canonical URL (`<link rel="canonical">`)
  - Structured Data (Schema.org - LocalBusiness, Restaurant)
- ห้ามสร้าง thin content pages (เนื้อหาบางเกินไป)
- MUST มี `sitemap.xml` และ `robots.txt` ที่ถูกต้อง

**Rationale:** SEO เป็นช่องทางหลักในการ acquire users สำหรับ directory/listing platforms

### II. Dark Modern Nightlife Design (NON-NEGOTIABLE)

ธีมการออกแบบ MUST ยึดตาม Dark Modern Nightlife aesthetic อย่างเคร่งครัด

**Color Palette (ใช้ hex เหล่านี้เท่านั้น):**
- Primary Gradient: `#EB1046` → `#6729FF`
- Grey Gradient: `#101828` → `#2B3139`
- Allowed Colors: `#EB1046`, `#6729FF`, `#E1BDFF`, `#101828`, `#2B3139`, `#636771`, `#C5CBD9`, `#FF384F`, `#DA5F6D`, `#EDAD4F`, `#21BF73`, `#1C1C1C`, `#F2F2F2`

**Design Rules:**
- Primary buttons MUST use gradient (`#EB1046` → `#6729FF`)
- Border radius: 12–16px สำหรับ cards และ buttons
- Color contrast MUST เพียงพอสำหรับการอ่านในที่มืด (WCAG AA minimum)
- ห้ามใช้สีที่อยู่นอก palette ที่กำหนด

**Rationale:** Consistent branding สำคัญต่อ user trust และ brand recognition

### III. Clean Architecture

ระบบ MUST แบ่งแยก layers ชัดเจนระหว่าง Web, API, และ Database

**Rules:**
- Frontend (Web) ห้ามเข้าถึง Database โดยตรง
- API MUST เป็น single point of data access
- Business logic MUST อยู่ใน Service layer ไม่ใช่ใน Controller หรือ UI
- Database queries MUST อยู่ใน Repository/Data Access layer เท่านั้น
- ห้ามมี circular dependencies ระหว่าง layers

**Rationale:** Clean separation ช่วยให้ scale และ maintain ได้ง่าย

### IV. Performance & Scale

ระบบ MUST รองรับจำนวนหน้าเยอะ (ร้าน × จังหวัด × หมวด) และโหลดเร็ว

**Rules:**
- Page load time MUST < 3 seconds บน 3G connection
- Largest Contentful Paint (LCP) MUST < 2.5 seconds
- First Input Delay (FID) MUST < 100ms
- Cumulative Layout Shift (CLS) MUST < 0.1
- Images MUST use lazy loading และ optimized formats (WebP/AVIF)
- API responses MUST implement caching strategies ที่เหมาะสม
- Static pages SHOULD use ISR (Incremental Static Regeneration) เมื่อเป็นไปได้

**Rationale:** Core Web Vitals ส่งผลต่อ SEO ranking และ user experience

### V. Analytics & Tracking Standards

ทุก user interaction ที่สำคัญ MUST ถูก track ผ่าน Google Analytics 4

**Rules:**
- GA4 MUST implement ผ่าน Google Tag Manager (GTM)
- Required events ที่ต้องมี:
  - `view_store` - เมื่อเปิดหน้าร้าน
  - `click_call` - เมื่อกดโทรหาร้าน
  - `click_line` - เมื่อกด LINE
  - `click_map` - เมื่อกดดูแผนที่
  - `search` - เมื่อค้นหา
  - `filter_type` - เมื่อ filter ตามประเภทร้าน
  - `filter_province` - เมื่อ filter ตามจังหวัด
- Event parameters MUST consistent และ documented
- ห้าม hardcode tracking IDs ใน source code (ต้องใช้ environment variables)

**Rationale:** Data-driven decisions ต้องอาศัย accurate และ complete tracking

### VI. Advertising System Standards

ระบบโฆษณา MUST แยกจากเนื้อหาปกติอย่างชัดเจน

**Rules:**
- Content ที่เป็นโฆษณา MUST มีคำว่า "Sponsored" หรือ "โฆษณา" แสดงชัดเจน
- Ad placements MUST ไม่รบกวน user experience หลัก
- Ad system MUST รองรับการขาย ad space ให้ร้านค้าและแบรนด์ (internal ads)
- ระบบ MUST extensible เพื่อรองรับ ad formats ใหม่ในอนาคต
- Ad performance MUST trackable (impressions, clicks)

**Rationale:** การแยก ads จาก organic content ชัดเจนสร้าง user trust และ comply กับ advertising standards

### VII. Code Quality Standards

โค้ด MUST ผ่านมาตรฐานคุณภาพที่กำหนด

**Rules:**
- ทุก public function/method MUST มี input validation
- Error handling MUST implement properly (ห้าม swallow errors)
- Code MUST readable และ self-documenting
- Variable/function names MUST descriptive
- Magic numbers/strings MUST defined as constants
- ห้าม commit code ที่มี TypeScript/lint errors

**Rationale:** Code quality ส่งผลโดยตรงต่อ maintainability และ bug rate

## Technology Stack Standards

### Frontend

- **Language**: TypeScript (strict mode) เท่านั้น - ห้ามใช้ plain JavaScript
- **Framework**: Next.js (สำหรับ SSR/SSG capabilities)
- **Styling**: ต้องยึดตาม CI colors ใน Principle II

### Backend

- **Runtime**: .NET 8
- **Architecture**: RESTful API
- **Database**: ต้องแยก layer ชัดเจนตาม Principle III

### General

- Environment variables สำหรับ configuration
- Secrets ห้ามอยู่ใน source code
- ต้องมี development, staging, production environments

## SEO & Content Standards

### URL Structure

- Format: `/{province}/{category}/{store-slug}`
- Province และ category MUST เป็น lowercase Thai transliteration หรือ English
- Store slug MUST unique และ descriptive

### Content Requirements

- ทุก store page MUST มี:
  - ชื่อร้าน
  - รูปภาพอย่างน้อย 1 รูป
  - ที่อยู่
  - ประเภทร้าน
  - เวลาเปิด-ปิด (ถ้ามี)
- Listing pages MUST แสดงอย่างน้อย 10 ร้านต่อหน้า (ไม่ใช่ empty pages)

### Structured Data

- Store pages MUST implement `LocalBusiness` schema
- Restaurant stores MUST เพิ่ม `Restaurant` schema
- Breadcrumbs MUST implement `BreadcrumbList` schema

## Governance

### Amendment Process

1. การเปลี่ยนแปลง Constitution ต้องได้รับ approval จาก project owner
2. ทุกการเปลี่ยนแปลงต้อง document ใน Sync Impact Report
3. Dependent templates ต้องถูก review และ update ตาม
4. Version MUST increment ตาม semantic versioning:
   - MAJOR: เปลี่ยน/ลบ core principles
   - MINOR: เพิ่ม principle หรือ section ใหม่
   - PATCH: แก้ไข wording, clarifications

### Compliance

- ทุก PR MUST ถูก review ว่า comply กับ Constitution
- Constitution Check ใน plan-template.md MUST ผ่านก่อน implementation
- Violations ต้องมี justification และ approval

### Versioning Policy

- Version format: MAJOR.MINOR.PATCH
- Changes logged in Sync Impact Report comment block
- Constitution supersedes all other documentation in case of conflict

**Version**: 1.0.0 | **Ratified**: 2026-01-17 | **Last Amended**: 2026-01-17
