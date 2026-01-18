#!/usr/bin/env python3
"""
Import store data from Excel to PostgreSQL database.
Generates SQL file for importing stores from data/Copy of กรุงเทพ-ปริมณฑล.xlsx
and copies images to the uploads folder.
"""

import os
import sys
import uuid
import re
import shutil
from pathlib import Path
import pandas as pd

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
EXCEL_FILE = DATA_DIR / "Copy of กรุงเทพ-ปริมณฑล.xlsx"
OUTPUT_SQL = PROJECT_ROOT / "scripts" / "import_stores.sql"
UPLOADS_DIR = PROJECT_ROOT / "backend" / "src" / "Nightnice.Api" / "uploads" / "stores"

# Image folders
IMAGE_FOLDERS = [
    DATA_DIR / "ภาคกลาง",
    DATA_DIR / "รูปภาพสถานประกอบการ",
    DATA_DIR / "รูปภาพสถานประกอบการ ครั้ง 2" / "ภาคเหนือ",
    DATA_DIR / "รูปภาพสถานประกอบการ ครั้ง 2" / "ภาคใต้",
    DATA_DIR / "รูปภาพสถานประกอบการ ครั้ง 2" / "ภาคอีสาน",
]

# Province name mapping (Excel sheet name -> database name)
PROVINCE_MAP = {
    "กรุงเทพ": "กรุงเทพมหานคร",
    "ชลบุรี": "ชลบุรี",
    "ปทุมธานี": "ปทุมธานี",
    "นนทบุรี": "นนทบุรี",
    "ระยอง": "ระยอง",
    "สมุทรปราการ": "สมุทรปราการ",
    "พระนครศรีอยุธยา": "พระนครศรีอยุธยา",
    "ลพบุรี": "ลพบุรี",
    "สิงห์บุรี": "สิงห์บุรี",
    "ชัยนาท": "ชัยนาท",
    "สระบุรี": "สระบุรี",
    "จันทบุรี": "จันทบุรี",
    "ตราด": "ตราด",
    "ฉะเชิงเทรา": "ฉะเชิงเทรา",
    "ปราจีนบุรี": "ปราจีนบุรี",
    "นครนายก": "นครนายก",
    "สระแก้ว": "สระแก้ว",
    "สมุทรสาคร": "สมุทรสาคร",
    "สมุทรสงคราม": "สมุทรสงคราม",
    # From other folders
    "เชียงใหม่": "เชียงใหม่",
    "เชียงราย": "เชียงราย",
    "ลำปาง": "ลำปาง",
    "ลำพูน": "ลำพูน",
    "แพร่": "แพร่",
    "น่าน": "น่าน",
    "พะเยา": "พะเยา",
    "แม่ฮ่องสอน": "แม่ฮ่องสอน",
    "อุตรดิตถ์": "อุตรดิตถ์",
    "ตาก": "ตาก",
    "สุโขทัย": "สุโขทัย",
    "พิษณุโลก": "พิษณุโลก",
    "พิจิตร": "พิจิตร",
    "เพชรบูรณ์": "เพชรบูรณ์",
    "นครสวรรค์": "นครสวรรค์",
    "อุทัยธานี": "อุทัยธานี",
    "กำแพงเพชร": "กำแพงเพชร",
    # Northeast
    "ขอนแก่น": "ขอนแก่น",
    "อุดรธานี": "อุดรธานี",
    "นครราชสีมา": "นครราชสีมา",
    "อุบลราชธานี": "อุบลราชธานี",
    "บุรีรัมย์": "บุรีรัมย์",
    "สุรินทร์": "สุรินทร์",
    "ศรีสะเกษ": "ศรีสะเกษ",
    "มหาสารคาม": "มหาสารคาม",
    "ชัยภูมิ": "ชัยภูมิ",
    "เลย": "เลย",
    "สกลนคร": "สกลนคร",
    "หนองคาย": "หนองคาย",
    "บึงกาฬ": "บึงกาฬ",
    "กาฬสินธุ์": "กาฬสินธุ์",
    # South
    "ภูเก็ต": "ภูเก็ต",
    "สงขลา": "สงขลา",
    "สุราษฎร์ธานี": "สุราษฎร์ธานี",
    "กระบี่": "กระบี่",
    "นครศรีธรรมราช": "นครศรีธรรมราช",
    "ตรัง": "ตรัง",
    "พังงา": "พังงา",
    "ชุมพร": "ชุมพร",
    "ระนอง": "ระนอง",
    "พัทลุง": "พัทลุง",
    "สตูล": "สตูล",
    "ยะลา": "ยะลา",
    "ปัตตานี": "ปัตตานี",
    "นราธิวาาส": "นราธิวาส",
    "นราธิวาส": "นราธิวาส",
}

# Type to Category mapping
TYPE_TO_CATEGORY = {
    # บาร์ category
    "บาร์": "bar",
    "บาร์ ": "bar",
    " บาร์": "bar",
    "บาร์์": "bar",
    "บาร์ค็อกเทล": "bar",
    "บาร์ค๊อกเทล": "bar",
    "ค็อกเทลบาร์": "bar",
    "บาร์วิสกี้": "bar",
    "บาร์ไวน์": "bar",
    "บาร์เบียร์": "bar",
    "บาร์โรงแรม": "bar",
    "บาร์โฮส": "bar",
    "บาร์เกย์": "bar",
    "ที่พัก/บาร์": "bar",
    "คาเฟ่/บาร์": "bar",
    "ลานเบียร์": "bar",
    "โรงเบียร์": "bar",
    # ผับ category
    "ผับ": "pub",
    "ไนท์คลับ": "pub",
    "สถานบันเทิงยามค่ำคืน": "pub",
    # ร้านอาหาร category
    "บาร์/ร้านอาหาร": "late-night-restaurant",
    "บาร์ค๊อกเทล/ร้านอาหาร": "late-night-restaurant",
    "ผับ/ร้านอาหาร": "late-night-restaurant",
    "อาหารและเครื่องดื่ม": "late-night-restaurant",
    # ร้านเหล้า/คาราโอเกะ category
    "คาราโอเกะ": "liquor-store",
    "คาราโอเกะบาร์": "liquor-store",
    "คาราโอเกะ/บาร์": "liquor-store",
}


def generate_slug(name: str, existing_slugs: set) -> str:
    """Generate unique URL-friendly slug from Thai name."""
    # Remove special characters, keep Thai and alphanumeric
    slug = re.sub(r'[^\w\s\u0E00-\u0E7F-]', '', name.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = slug[:100]  # Limit length

    if not slug:
        slug = "store"

    # Ensure uniqueness
    original_slug = slug
    counter = 1
    while slug in existing_slugs:
        slug = f"{original_slug}-{counter}"
        counter += 1

    existing_slugs.add(slug)
    return slug


def escape_sql(value, max_length=None):
    """Escape string for SQL."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "NULL"
    value = str(value).replace("'", "''")
    if max_length and len(value) > max_length:
        value = value[:max_length]
    return f"'{value}'"


def find_local_images(province_name: str, row_index: int) -> list:
    """Find local images for a store based on province and row index."""
    images = []

    # Map Excel sheet province to folder name variations
    folder_names = [province_name]
    if province_name == "กรุงเทพ":
        folder_names.append("กรุงเทพ")

    for image_folder in IMAGE_FOLDERS:
        for folder_name in folder_names:
            province_folder = image_folder / folder_name
            if province_folder.exists():
                # Look for images with matching index
                # Format: "index province.jpg" e.g., "1 กรุงเทพ.jpg"
                for ext in ['jpg', 'jpeg', 'png', 'webp']:
                    patterns = [
                        f"{row_index + 1} {folder_name}.{ext}",
                        f"{row_index + 1}  {folder_name}.{ext}",  # double space
                        f"{row_index + 1} {folder_name.strip()}.{ext}",
                    ]
                    for pattern in patterns:
                        image_path = province_folder / pattern
                        if image_path.exists():
                            images.append(image_path)
                            break

    return images


def copy_image_to_uploads(image_path: Path, store_id: str) -> str:
    """Copy image to uploads folder and return relative URL."""
    store_upload_dir = UPLOADS_DIR / store_id
    store_upload_dir.mkdir(parents=True, exist_ok=True)

    dest_filename = f"banner{image_path.suffix}"
    dest_path = store_upload_dir / dest_filename

    shutil.copy2(image_path, dest_path)

    return f"/uploads/stores/{store_id}/{dest_filename}"


def main():
    print("=" * 60)
    print("Store Data Import Script")
    print("=" * 60)

    # Create uploads directory
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    # Read Excel file
    print(f"\nReading Excel file: {EXCEL_FILE}")
    xlsx = pd.ExcelFile(EXCEL_FILE)

    stores = []
    store_categories = []
    existing_slugs = set()

    for sheet_name in xlsx.sheet_names:
        print(f"  Processing sheet: {sheet_name}")
        df = pd.read_excel(xlsx, sheet_name=sheet_name)

        province_name = PROVINCE_MAP.get(sheet_name, sheet_name)

        for idx, row in df.iterrows():
            # Get name - skip if empty
            name = row.get('Name')
            if pd.isna(name) or not str(name).strip():
                continue

            name = str(name).strip()
            store_id = str(uuid.uuid4())
            slug = generate_slug(name, existing_slugs)

            # Get other fields
            description = row.get('Description')
            phone = row.get('Phone')
            address = row.get('AddressDescription')
            lat = row.get('lat')
            lng = row.get('long')
            google_map = row.get('Google Map')
            line_id = row.get('Line')
            store_type = row.get('Type', '')

            # Find local images
            local_images = find_local_images(sheet_name, idx)
            banner_url = None
            if local_images:
                banner_url = copy_image_to_uploads(local_images[0], store_id)

            # Map type to category
            category_slug = TYPE_TO_CATEGORY.get(str(store_type).strip(), "bar")

            stores.append({
                'id': store_id,
                'province_name': province_name,
                'name': name,
                'slug': slug,
                'description': description if not pd.isna(description) else None,
                'phone': phone if not pd.isna(phone) else None,
                'address': address if not pd.isna(address) else None,
                'latitude': lat if not pd.isna(lat) else None,
                'longitude': lng if not pd.isna(lng) else None,
                'google_map_url': google_map if not pd.isna(google_map) else None,
                'line_id': line_id if not pd.isna(line_id) else None,
                'banner_url': banner_url,
                'category_slug': category_slug,
            })

    print(f"\nTotal stores to import: {len(stores)}")

    # Generate SQL
    print(f"\nGenerating SQL file: {OUTPUT_SQL}")

    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("-- Auto-generated store import SQL\n")
        f.write("-- Generated by import_stores.py\n\n")

        f.write("-- No transaction to allow partial success\n\n")

        # Insert stores
        f.write("-- Insert stores\n")
        for store in stores:
            lat_val = store['latitude'] if store['latitude'] else "NULL"
            lng_val = store['longitude'] if store['longitude'] else "NULL"

            f.write(f"""
INSERT INTO "Stores" ("Id", "ProvinceId", "Name", "Slug", "Description", "Phone", "Address", "Latitude", "Longitude", "GoogleMapUrl", "LineId", "BannerUrl", "IsActive", "IsFeatured", "Facilities", "CreatedAt", "UpdatedAt")
SELECT
    '{store['id']}'::uuid,
    p."Id",
    {escape_sql(store['name'], 200)},
    {escape_sql(store['slug'], 200)},
    {escape_sql(store['description'])},
    {escape_sql(store['phone'], 20)},
    {escape_sql(store['address'])},
    {lat_val},
    {lng_val},
    {escape_sql(store['google_map_url'], 500)},
    {escape_sql(store['line_id'], 100)},
    {escape_sql(store['banner_url'], 500)},
    true,
    false,
    ARRAY[]::text[],
    NOW(),
    NOW()
FROM "Provinces" p
WHERE p."Name" = {escape_sql(store['province_name'])};
""")

        # Insert store categories
        f.write("\n-- Insert store categories\n")
        for store in stores:
            f.write(f"""
INSERT INTO "StoreCategories" ("StoreId", "CategoryId")
SELECT '{store['id']}'::uuid, c."Id"
FROM "Categories" c
WHERE c."Slug" = '{store['category_slug']}'
AND EXISTS (SELECT 1 FROM "Stores" WHERE "Id" = '{store['id']}'::uuid);
""")

        f.write("\n-- Done\n")

    print(f"\nSQL file generated: {OUTPUT_SQL}")
    print(f"Images copied to: {UPLOADS_DIR}")
    print("\nTo import, run:")
    print(f"  psql -d nightnice -f {OUTPUT_SQL}")
    print("\nOr if using Docker:")
    print("  docker exec -i <container> psql -U postgres -d nightnice < scripts/import_stores.sql")


if __name__ == "__main__":
    main()
