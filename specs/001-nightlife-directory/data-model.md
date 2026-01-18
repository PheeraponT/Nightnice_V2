# Data Model: Thailand Nightlife Directory

**Branch**: `001-nightlife-directory` | **Date**: 2026-01-17

## Entity Relationship Diagram (Conceptual)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Region    │       │  Province   │       │  Category   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ region_id   │       │ id (PK)     │
│ name        │       │ id (PK)     │       │ name        │
│ slug        │       │ name        │       │ slug        │
│ sort_order  │       │ slug        │       │ sort_order  │
└─────────────┘       │ seo_desc    │       │ created_at  │
                      │ sort_order  │       │ updated_at  │
                      │ created_at  │       └──────┬──────┘
                      │ updated_at  │              │
                      └──────┬──────┘              │
                             │                     │
                             │                     │
                      ┌──────▼──────┐       ┌──────▼──────┐
                      │    Store    │◄──────│StoreCategory│
                      ├─────────────┤       ├─────────────┤
                      │ id (PK)     │       │ store_id    │
                      │ province_id │       │ category_id │
                      │ name        │       └─────────────┘
                      │ slug        │
                      │ description │
                      │ logo_url    │
                      │ banner_url  │
                      │ phone       │
                      │ address     │
                      │ latitude    │       ┌─────────────┐
                      │ longitude   │       │ StoreImage  │
                      │ google_map  │       ├─────────────┤
                      │ line_id     │◄──────│ id (PK)     │
                      │ facebook    │       │ store_id    │
                      │ instagram   │       │ url         │
                      │ price_range │       │ sort_order  │
                      │ open_time   │       │ created_at  │
                      │ close_time  │       └─────────────┘
                      │ facilities  │
                      │ is_active   │       ┌─────────────────┐
                      │ is_featured │       │  Advertisement  │
                      │ created_at  │       ├─────────────────┤
                      │ updated_at  │       │ id (PK)         │
                      └──────┬──────┘       │ type            │
                             │              │ store_id (opt)  │
                             │              │ image_url       │
                             │              │ target_url      │
                             │              │ target_provinces│
                             │              │ target_categories│
                             │              │ start_date      │
                             │              │ end_date        │
                             │              │ is_active       │
                             │              │ created_at      │
                             │              │ updated_at      │
                             │              └────────┬────────┘
                             │                       │
                      ┌──────▼──────┐       ┌────────▼────────┐
                      │ContactInquiry│      │    AdMetric     │
                      ├─────────────┤       ├─────────────────┤
                      │ id (PK)     │       │ id (PK)         │
                      │ name        │       │ ad_id           │
                      │ phone       │       │ event_type      │
                      │ email       │       │ page_context    │
                      │ message     │       │ created_at      │
                      │ created_at  │       └─────────────────┘
                      └─────────────┘

                      ┌─────────────┐
                      │  AdminUser  │
                      ├─────────────┤
                      │ id (PK)     │
                      │ username    │
                      │ password    │
                      │ email       │
                      │ created_at  │
                      │ updated_at  │
                      └─────────────┘
```

## Entity Definitions

### Region (ภูมิภาค)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(100) | NOT NULL, UNIQUE | ชื่อภูมิภาค (กลาง, เหนือ, อีสาน, ตะวันออก, ตะวันตก, ใต้) |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| sort_order | INT | NOT NULL, DEFAULT 0 | ลำดับการแสดงผล |

**Seed Data**: 6 regions (กลาง, เหนือ, อีสาน, ตะวันออก, ตะวันตก, ใต้)

---

### Province (จังหวัด)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| region_id | UUID | FK → Region, NOT NULL | ภูมิภาคที่จังหวัดสังกัด |
| name | VARCHAR(100) | NOT NULL, UNIQUE | ชื่อจังหวัด |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| seo_description | TEXT | NULL | ข้อความแนะนำสำหรับ SEO |
| sort_order | INT | NOT NULL, DEFAULT 0 | ลำดับการแสดงผล |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่อัปเดตล่าสุด |

**Seed Data**: 77 provinces (from Google Sheet)

**Validation Rules**:
- name: Required, max 100 chars
- slug: Required, lowercase, alphanumeric + hyphen only

---

### Category (ประเภทร้าน)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(100) | NOT NULL, UNIQUE | ชื่อประเภทร้าน |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| sort_order | INT | NOT NULL, DEFAULT 0 | ลำดับการแสดงผล |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่อัปเดตล่าสุด |

**Seed Data**: 4 categories (ร้านเหล้า, บาร์, ผับ, ร้านอาหารกลางคืน)

---

### Store (ร้าน)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| province_id | UUID | FK → Province, NOT NULL | จังหวัดที่ร้านตั้งอยู่ |
| name | VARCHAR(200) | NOT NULL | ชื่อร้าน |
| slug | VARCHAR(200) | NOT NULL, UNIQUE | URL-friendly identifier |
| description | TEXT | NULL | คำอธิบายร้าน |
| logo_url | VARCHAR(500) | NULL | URL รูป Logo |
| banner_url | VARCHAR(500) | NULL | URL รูป Banner |
| phone | VARCHAR(20) | NULL | เบอร์โทรศัพท์ |
| address | TEXT | NULL | ที่อยู่ |
| latitude | DECIMAL(10,8) | NULL | พิกัดละติจูด |
| longitude | DECIMAL(11,8) | NULL | พิกัดลองจิจูด |
| google_map_url | VARCHAR(500) | NULL | URL Google Maps |
| line_id | VARCHAR(100) | NULL | LINE ID หรือ LINE OA |
| facebook_url | VARCHAR(500) | NULL | URL Facebook page |
| instagram_url | VARCHAR(500) | NULL | URL Instagram profile |
| price_range | SMALLINT | NULL, CHECK (1-4) | ช่วงราคา (1=$, 2=$$, 3=$$$, 4=$$$$) |
| open_time | TIME | NULL | เวลาเปิด |
| close_time | TIME | NULL | เวลาปิด (รองรับข้ามวัน) |
| facilities | JSONB | DEFAULT '[]' | สิ่งอำนวยความสะดวก |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | สถานะการแสดงผล |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false | ร้านแนะนำ |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่อัปเดตล่าสุด |

**Facilities JSON Structure**:
```json
["parking", "live_music", "karaoke", "outdoor_seating", "wifi", "reservation"]
```

**Validation Rules**:
- name: Required, max 200 chars
- slug: Required, lowercase, unique
- latitude: -90 to 90
- longitude: -180 to 180
- price_range: 1-4 only
- facilities: Valid JSON array of predefined strings

**Indexes**:
- `idx_store_province` on province_id
- `idx_store_active` on is_active
- `idx_store_featured` on is_featured
- `idx_store_location` on (latitude, longitude) - for nearby queries

---

### StoreCategory (ร้าน-ประเภท Many-to-Many)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| store_id | UUID | FK → Store, PK | ร้าน |
| category_id | UUID | FK → Category, PK | ประเภท |

**Note**: Composite primary key (store_id, category_id)

---

### StoreImage (รูปภาพร้าน Gallery)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| store_id | UUID | FK → Store, NOT NULL, ON DELETE CASCADE | ร้านที่รูปภาพสังกัด |
| url | VARCHAR(500) | NOT NULL | URL รูปภาพ |
| sort_order | INT | NOT NULL, DEFAULT 0 | ลำดับการแสดงผล |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |

---

### Advertisement (โฆษณา)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| type | VARCHAR(20) | NOT NULL, CHECK | ประเภทโฆษณา: 'banner', 'sponsored', 'featured' |
| store_id | UUID | FK → Store, NULL | ร้านที่เกี่ยวข้อง (ถ้ามี) |
| image_url | VARCHAR(500) | NULL | URL รูปภาพโฆษณา (สำหรับ banner) |
| target_url | VARCHAR(500) | NULL | URL ปลายทางเมื่อคลิก |
| target_provinces | UUID[] | DEFAULT '{}' | จังหวัดเป้าหมาย (empty = ทุกจังหวัด) |
| target_categories | UUID[] | DEFAULT '{}' | ประเภทร้านเป้าหมาย (empty = ทุกประเภท) |
| start_date | DATE | NOT NULL | วันที่เริ่มแสดง |
| end_date | DATE | NOT NULL | วันที่สิ้นสุดแสดง |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | สถานะการแสดงผล |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่อัปเดตล่าสุด |

**Ad Types**:
- `banner`: Banner โฆษณา (ใช้ image_url)
- `sponsored`: Sponsored Store Card (ใช้ store_id)
- `featured`: Featured Store (ใช้ store_id, ทำให้ร้านโดดเด่น)

**Validation Rules**:
- type: Must be one of: 'banner', 'sponsored', 'featured'
- start_date <= end_date
- If type='banner': image_url required
- If type='sponsored' or 'featured': store_id required

---

### AdMetric (ข้อมูลโฆษณา)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| ad_id | UUID | FK → Advertisement, NOT NULL | โฆษณาที่เกี่ยวข้อง |
| event_type | VARCHAR(20) | NOT NULL, CHECK | ประเภท: 'impression', 'click' |
| page_context | VARCHAR(100) | NULL | หน้าที่แสดงโฆษณา |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | เวลาที่เกิดเหตุการณ์ |

**Indexes**:
- `idx_admetric_ad` on ad_id
- `idx_admetric_created` on created_at
- `idx_admetric_ad_type` on (ad_id, event_type)

**Note**: Consider partitioning by created_at for large datasets

---

### ContactInquiry (ข้อมูลติดต่อ)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(200) | NOT NULL | ชื่อผู้ติดต่อ |
| phone | VARCHAR(20) | NOT NULL | เบอร์โทรศัพท์ |
| email | VARCHAR(200) | NOT NULL | อีเมล |
| message | TEXT | NOT NULL | ข้อความ |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่ส่ง |

**Validation Rules**:
- name: Required, max 200 chars
- phone: Required, Thai phone format
- email: Required, valid email format
- message: Required, min 10 chars

---

### AdminUser (ผู้ดูแลระบบ)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| username | VARCHAR(100) | NOT NULL, UNIQUE | ชื่อผู้ใช้ |
| password_hash | VARCHAR(255) | NOT NULL | รหัสผ่าน (BCrypt hashed) |
| email | VARCHAR(200) | NOT NULL, UNIQUE | อีเมล |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่สร้าง |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | วันที่อัปเดตล่าสุด |

---

## State Transitions

### Store Status
```
[Draft] ---(activate)---> [Active] ---(deactivate)---> [Inactive]
                              ^                            |
                              |                            |
                              +---------(reactivate)-------+
```

### Advertisement Status
```
[Created] ---(start_date reached)---> [Active] ---(end_date passed)---> [Expired]
              |                           |
              +----(deactivate manually)--+---> [Inactive]
```

## Database Indexes Summary

```sql
-- Store indexes
CREATE INDEX idx_store_province ON stores(province_id);
CREATE INDEX idx_store_active ON stores(is_active);
CREATE INDEX idx_store_featured ON stores(is_featured);
CREATE INDEX idx_store_location ON stores(latitude, longitude);
CREATE INDEX idx_store_slug ON stores(slug);

-- Advertisement indexes
CREATE INDEX idx_ad_active ON advertisements(is_active);
CREATE INDEX idx_ad_dates ON advertisements(start_date, end_date);
CREATE INDEX idx_ad_type ON advertisements(type);

-- AdMetric indexes (consider partitioning)
CREATE INDEX idx_admetric_ad ON ad_metrics(ad_id);
CREATE INDEX idx_admetric_created ON ad_metrics(created_at);
CREATE INDEX idx_admetric_ad_type ON ad_metrics(ad_id, event_type);

-- Full-text search
CREATE INDEX idx_store_name_trgm ON stores USING gin(name gin_trgm_ops);
CREATE INDEX idx_store_desc_trgm ON stores USING gin(description gin_trgm_ops);
```

## Migration Strategy

1. Create base tables (Region, Province, Category, AdminUser)
2. Seed regions (6 records)
3. Seed provinces (77 records from Google Sheet)
4. Seed categories (4 records)
5. Create Store and related tables
6. Create Advertisement tables
7. Create indexes
8. Create initial admin user
