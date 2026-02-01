#!/bin/bash
# Store Migration Deployment Script
# Run this on the VPS after extracting the migration package

set -e

echo "=== Store Migration Deployment ==="

# Check if running in correct directory
if [ ! -f "migration_stores.sql" ]; then
    echo "Error: Run this script from the migration_package directory"
    exit 1
fi

# Load environment
if [ -f "../.env" ]; then
    source ../.env
fi

DB_NAME=${DB_NAME:-nightnice}
DB_USER=${DB_USER:-nightnice}

echo ""
echo "Step 1: Copying images to uploads folder..."
if [ -d "uploads" ]; then
    # Find the project uploads directory
    UPLOADS_TARGET="/app/uploads"

    # If running on host (not in container), adjust path
    if [ ! -d "$UPLOADS_TARGET" ]; then
        UPLOADS_TARGET="../backend/src/Nightnice.Api/uploads"
    fi

    mkdir -p "$UPLOADS_TARGET/stores"
    cp -r uploads/stores/* "$UPLOADS_TARGET/stores/" 2>/dev/null || true
    echo "   Images copied to $UPLOADS_TARGET/stores/"
else
    echo "   No images to copy"
fi

echo ""
echo "Step 2: Running SQL migration..."

# Check if we're in Docker environment
if command -v docker &> /dev/null && docker ps | grep -q postgres; then
    echo "   Running via Docker..."
    docker exec -i $(docker ps -qf "name=postgres") psql -U "$DB_USER" -d "$DB_NAME" < migration_stores.sql
elif command -v psql &> /dev/null; then
    echo "   Running via psql..."
    psql -U "$DB_USER" -d "$DB_NAME" < migration_stores.sql
else
    echo "Error: Cannot connect to database. Make sure PostgreSQL is running."
    exit 1
fi

echo ""
echo "=== Migration Complete ==="
echo "Stores imported successfully!"
