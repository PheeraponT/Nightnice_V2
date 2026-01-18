# Quickstart: Thailand Nightlife Directory

**Branch**: `001-nightlife-directory` | **Date**: 2026-01-17

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20 LTS | Frontend development |
| .NET SDK | 8.0+ | Backend development |
| PostgreSQL | 15+ | Database |
| Docker | Latest | Local development (optional) |

### Accounts & Services

| Service | Purpose | Required For |
|---------|---------|--------------|
| Cloudflare R2 | Image storage | Image uploads |
| Vercel / Cloudflare Pages | Frontend hosting | Deployment |
| Azure / Render / Fly.io | Backend hosting | Deployment |

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd nightnice
git checkout 001-nightlife-directory
```

### 2. Database Setup

**Option A: Docker (Recommended)**

```bash
docker run -d \
  --name nightnice-db \
  -e POSTGRES_USER=nightnice \
  -e POSTGRES_PASSWORD=nightnice_dev \
  -e POSTGRES_DB=nightnice \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B: Local PostgreSQL**

```bash
createdb nightnice
psql nightnice -c "CREATE USER nightnice WITH PASSWORD 'nightnice_dev';"
psql nightnice -c "GRANT ALL PRIVILEGES ON DATABASE nightnice TO nightnice;"
```

### 3. Backend Setup

```bash
cd backend/src/Nightnice.Api

# Restore packages
dotnet restore

# Create appsettings.Development.json
cat > appsettings.Development.json << 'EOF'
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=nightnice;Username=nightnice;Password=nightnice_dev"
  },
  "Jwt": {
    "SecretKey": "your-256-bit-secret-key-for-development-only",
    "Issuer": "nightnice-api",
    "Audience": "nightnice-app",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "Cloudflare": {
    "R2AccountId": "your-account-id",
    "R2AccessKeyId": "your-access-key",
    "R2SecretAccessKey": "your-secret-key",
    "R2BucketName": "nightnice-images",
    "PublicUrl": "https://images.nightnice.com"
  }
}
EOF

# Run migrations
dotnet ef database update

# Start API server
dotnet run
```

API will be available at: `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
EOF

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Seed Data

### Run Initial Seed

The seed script populates:
- 6 regions (ภูมิภาค)
- 77 provinces (จังหวัด)
- 4 categories (ประเภทร้าน)
- 1 admin user

```bash
cd backend/src/Nightnice.Api
dotnet run -- seed
```

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `Admin@123` |
| Email | `admin@nightnice.com` |

**Important**: Change the admin password after first login!

## Directory Structure

```
nightnice/
├── backend/
│   ├── src/
│   │   └── Nightnice.Api/
│   │       ├── Program.cs
│   │       ├── Endpoints/
│   │       ├── Services/
│   │       ├── Data/
│   │       ├── Models/
│   │       ├── DTOs/
│   │       └── Auth/
│   └── tests/
│       └── Nightnice.Api.Tests/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   ├── public/
│   └── tests/
└── specs/
    └── 001-nightlife-directory/
```

## Development Workflow

### Backend

```bash
# Run with hot reload
cd backend/src/Nightnice.Api
dotnet watch run

# Run tests
cd backend/tests/Nightnice.Api.Tests
dotnet test

# Add migration
dotnet ef migrations add <MigrationName>

# Update database
dotnet ef database update
```

### Frontend

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## API Testing

### Swagger UI

Access Swagger UI at: `http://localhost:5000/swagger`

### Sample API Calls

```bash
# List stores
curl http://localhost:5000/api/stores

# Get store by slug
curl http://localhost:5000/api/stores/some-store-slug

# List provinces
curl http://localhost:5000/api/provinces

# Admin login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Create store (with token)
curl -X POST http://localhost:5000/api/admin/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "Test Bar",
    "province_id": "<province-uuid>",
    "category_ids": ["<category-uuid>"]
  }'
```

## Environment Variables

### Backend (.NET)

| Variable | Description | Example |
|----------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=localhost;Database=nightnice;...` |
| `Jwt__SecretKey` | JWT signing key (min 256 bits) | `your-256-bit-secret` |
| `Jwt__Issuer` | JWT issuer | `nightnice-api` |
| `Jwt__Audience` | JWT audience | `nightnice-app` |
| `Cloudflare__R2AccountId` | Cloudflare account ID | `abc123...` |
| `Cloudflare__R2AccessKeyId` | R2 access key | `...` |
| `Cloudflare__R2SecretAccessKey` | R2 secret key | `...` |
| `Cloudflare__R2BucketName` | R2 bucket name | `nightnice-images` |
| `Cloudflare__PublicUrl` | Public CDN URL | `https://images.nightnice.com` |

### Frontend (Next.js)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID | `GTM-XXXXXXX` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (for SEO) | `https://nightnice.com` |

## Troubleshooting

### Database Connection Failed

1. Check PostgreSQL is running:
   ```bash
   docker ps | grep nightnice-db
   # or
   pg_isready
   ```

2. Verify connection string in `appsettings.Development.json`

3. Check if database exists:
   ```bash
   psql -l | grep nightnice
   ```

### API Returns 401 Unauthorized

1. Check JWT token is valid and not expired
2. Verify token format: `Bearer <token>` (with space)
3. Check JWT secret matches between login and validation

### Frontend Can't Connect to API

1. Verify API is running on port 5000
2. Check CORS settings in backend
3. Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Image Upload Failed

1. Check Cloudflare R2 credentials
2. Verify bucket permissions
3. Check file size (max 10MB recommended)

## Next Steps

1. Review [spec.md](./spec.md) for feature requirements
2. Review [data-model.md](./data-model.md) for database schema
3. Review [contracts/api.yaml](./contracts/api.yaml) for API endpoints
4. Run `/speckit.tasks` to generate implementation tasks
