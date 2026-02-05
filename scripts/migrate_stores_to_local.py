#!/usr/bin/env python3
"""
Migrate Stores from Remote to Local Database
Copies all stores, categories, images, and related data from production to local dev environment
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import sys

# Database configurations
REMOTE_DB = {
    'host': '76.13.18.207',
    'port': 5432,
    'database': 'nightnice',
    'user': 'nightniceuser',
    'password': 'NightNice2024!Secure'
}

LOCAL_DB = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nightnice',
    'user': 'nightniceuser',
    'password': 'NightNice2024!Secure'
}

def connect_db(config, name):
    """Connect to database"""
    try:
        conn = psycopg2.connect(**config)
        print(f"✓ Connected to {name} database")
        return conn
    except Exception as e:
        print(f"✗ Failed to connect to {name} database: {e}")
        sys.exit(1)

def fetch_data(conn, query, params=None):
    """Fetch data from database"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        return cur.fetchall()

def insert_data(conn, table, data, conflict_column=None):
    """Insert data into database with conflict handling"""
    if not data:
        return 0

    # Get column names from first row
    columns = list(data[0].keys())
    placeholders = ', '.join(['%s'] * len(columns))
    column_names = ', '.join([f'"{col}"' for col in columns])

    # Build conflict clause
    conflict_clause = ""
    if conflict_column:
        update_cols = [f'"{col}" = EXCLUDED."{col}"' for col in columns if col != conflict_column]
        conflict_clause = f'ON CONFLICT ("{conflict_column}") DO UPDATE SET {", ".join(update_cols)}'

    query = f'INSERT INTO "{table}" ({column_names}) VALUES ({placeholders}) {conflict_clause}'

    inserted = 0
    with conn.cursor() as cur:
        for row in data:
            try:
                values = [row[col] for col in columns]
                cur.execute(query, values)
                inserted += 1
            except Exception as e:
                print(f"  ⚠ Error inserting into {table}: {e}")
                conn.rollback()
                continue

    conn.commit()
    return inserted

def migrate_regions(remote_conn, local_conn):
    """Migrate Regions"""
    print("\n📍 Migrating Regions...")
    regions = fetch_data(remote_conn, 'SELECT * FROM "Regions" ORDER BY "SortOrder"')
    inserted = insert_data(local_conn, "Regions", regions, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(regions)} regions")
    return len(regions)

def migrate_provinces(remote_conn, local_conn):
    """Migrate Provinces"""
    print("\n🗺️  Migrating Provinces...")
    provinces = fetch_data(remote_conn, 'SELECT * FROM "Provinces" ORDER BY "SortOrder"')
    inserted = insert_data(local_conn, "Provinces", provinces, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(provinces)} provinces")
    return len(provinces)

def migrate_categories(remote_conn, local_conn):
    """Migrate Categories"""
    print("\n🏷️  Migrating Categories...")
    categories = fetch_data(remote_conn, 'SELECT * FROM "Categories" ORDER BY "SortOrder"')
    inserted = insert_data(local_conn, "Categories", categories, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(categories)} categories")
    return len(categories)

def migrate_stores(remote_conn, local_conn):
    """Migrate Stores"""
    print("\n🏪 Migrating Stores...")
    stores = fetch_data(remote_conn, '''
        SELECT * FROM "Stores"
        WHERE "IsActive" = true
        ORDER BY "IsFeatured" DESC, "CreatedAt" DESC
    ''')
    inserted = insert_data(local_conn, "Stores", stores, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(stores)} stores")
    return len(stores)

def migrate_store_categories(remote_conn, local_conn):
    """Migrate Store-Category relationships"""
    print("\n🔗 Migrating Store-Category relationships...")
    relations = fetch_data(remote_conn, 'SELECT * FROM "StoreCategories"')

    # Manual insert for many-to-many with composite key
    inserted = 0
    with local_conn.cursor() as cur:
        for rel in relations:
            try:
                cur.execute('''
                    INSERT INTO "StoreCategories" ("StoreId", "CategoryId")
                    VALUES (%s, %s)
                    ON CONFLICT ("StoreId", "CategoryId") DO NOTHING
                ''', (rel['StoreId'], rel['CategoryId']))
                inserted += cur.rowcount
            except Exception as e:
                print(f"  ⚠ Error: {e}")
                local_conn.rollback()
                continue

    local_conn.commit()
    print(f"  ✓ Migrated {inserted}/{len(relations)} relationships")
    return len(relations)

def migrate_store_images(remote_conn, local_conn):
    """Migrate Store Images"""
    print("\n🖼️  Migrating Store Images...")
    images = fetch_data(remote_conn, 'SELECT * FROM "StoreImages" ORDER BY "SortOrder"')
    inserted = insert_data(local_conn, "StoreImages", images, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(images)} images")
    return len(images)

def migrate_advertisements(remote_conn, local_conn):
    """Migrate Advertisements"""
    print("\n📢 Migrating Advertisements...")
    ads = fetch_data(remote_conn, '''
        SELECT * FROM "Advertisements"
        WHERE "IsActive" = true AND "EndDate" > CURRENT_TIMESTAMP
        ORDER BY "Priority" DESC
    ''')
    inserted = insert_data(local_conn, "Advertisements", ads, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(ads)} active advertisements")
    return len(ads)

def migrate_events(remote_conn, local_conn):
    """Migrate Events"""
    print("\n🎉 Migrating Events...")
    events = fetch_data(remote_conn, '''
        SELECT * FROM "Events"
        WHERE "IsActive" = true
        ORDER BY "StartDate" DESC
        LIMIT 100
    ''')
    inserted = insert_data(local_conn, "Events", events, conflict_column="Id")
    print(f"  ✓ Migrated {inserted}/{len(events)} events")
    return len(events)

def verify_migration(local_conn):
    """Verify migration results"""
    print("\n✅ Verifying migration...")

    tables = [
        "Regions",
        "Provinces",
        "Categories",
        "Stores",
        "StoreCategories",
        "StoreImages",
        "Advertisements",
        "Events"
    ]

    for table in tables:
        count = fetch_data(local_conn, f'SELECT COUNT(*) as count FROM "{table}"')[0]['count']
        print(f"  • {table}: {count} records")

def main():
    print("=" * 60)
    print("🔄 Store Migration: Remote → Local")
    print("=" * 60)

    # Connect to databases
    print("\n🔌 Connecting to databases...")
    remote_conn = connect_db(REMOTE_DB, "REMOTE")
    local_conn = connect_db(LOCAL_DB, "LOCAL")

    try:
        # Run migrations in order (respecting foreign key constraints)
        total = 0

        total += migrate_regions(remote_conn, local_conn)
        total += migrate_provinces(remote_conn, local_conn)
        total += migrate_categories(remote_conn, local_conn)
        total += migrate_stores(remote_conn, local_conn)
        total += migrate_store_categories(remote_conn, local_conn)
        total += migrate_store_images(remote_conn, local_conn)
        total += migrate_advertisements(remote_conn, local_conn)
        total += migrate_events(remote_conn, local_conn)

        # Verify
        verify_migration(local_conn)

        print("\n" + "=" * 60)
        print(f"✅ Migration completed successfully!")
        print(f"📊 Total records processed: {total}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        remote_conn.close()
        local_conn.close()
        print("\n🔌 Connections closed")

if __name__ == "__main__":
    main()
