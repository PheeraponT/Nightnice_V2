# Nightnice Deployment Guide

## Requirements

- **VPS**: 2GB RAM minimum, 50GB SSD
- **OS**: Ubuntu 24.04 LTS (recommended)
- **Domain**: With DNS pointing to VPS IP

---

## Quick Start

### 1. Create VPS on Hostinger

1. Go to [Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. Choose **KVM 2** plan (2GB RAM, 2 vCPU, 50GB SSD) or higher
3. Select **Ubuntu 24.04 LTS** as OS
4. Complete purchase and note your VPS IP

### 2. Point Domain to VPS

In your domain DNS settings, add:
```
A    @       YOUR_VPS_IP
A    www     YOUR_VPS_IP
```

### 3. Connect to VPS

```bash
ssh root@YOUR_VPS_IP
```

### 4. Clone and Setup

```bash
# Update system
apt update && apt upgrade -y

# Clone project
git clone https://github.com/YOUR_USERNAME/Nightnice_V2.git
cd Nightnice_V2

# Run setup (installs Docker, creates SSL)
./scripts/deploy.sh setup

# Logout and login again for Docker permissions
exit
ssh root@YOUR_VPS_IP
cd Nightnice_V2
```

### 5. Configure Environment

```bash
# Create .env from template
cp .env.example .env

# Edit configuration
nano .env
```

**Required settings:**
```env
DB_PASSWORD=<strong-password-here>
JWT_SECRET_KEY=<random-32-char-string>
CORS_ORIGIN=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

Generate secure values:
```bash
# Generate random password
openssl rand -base64 32

# Generate JWT secret
openssl rand -hex 32
```

### 6. Deploy

```bash
./scripts/deploy.sh deploy
```

### 7. Setup SSL Certificate

```bash
./scripts/deploy.sh ssl your-domain.com
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `./scripts/deploy.sh setup` | Initial server setup |
| `./scripts/deploy.sh deploy` | Build and start all services |
| `./scripts/deploy.sh update` | Pull latest code and redeploy |
| `./scripts/deploy.sh stop` | Stop all services |
| `./scripts/deploy.sh logs` | View all logs |
| `./scripts/deploy.sh logs backend` | View backend logs only |
| `./scripts/deploy.sh logs frontend` | View frontend logs only |
| `./scripts/deploy.sh backup` | Backup database |
| `./scripts/deploy.sh restore <file>` | Restore database from backup |
| `./scripts/deploy.sh ssl <domain>` | Setup Let's Encrypt SSL |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                            │
└─────────────────────────┬───────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │   Nginx   │ :80, :443
                    │  (proxy)  │
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │ Frontend  │   │  Backend  │   │  /uploads │
    │ (Next.js) │   │  (.NET)   │   │  (static) │
    │   :3000   │   │   :5005   │   │           │
    └───────────┘   └─────┬─────┘   └───────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL│
                    │   :5432   │
                    └───────────┘
```

---

## Maintenance

### Update Application

```bash
cd Nightnice_V2
./scripts/deploy.sh update
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart Services

```bash
docker compose restart
```

### Database Backup

Automatic backup:
```bash
./scripts/deploy.sh backup
```

Backups are stored in `backups/` directory. Last 7 backups are kept.

### Restore Database

```bash
./scripts/deploy.sh restore backups/nightnice_20240115_120000.sql.gz
```

---

## Troubleshooting

### Services not starting

```bash
# Check status
docker compose ps

# Check logs
docker compose logs

# Restart everything
docker compose down
docker compose up -d
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# Restart nginx
docker compose restart nginx
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Connect to database manually
docker compose exec postgres psql -U nightnice -d nightnice
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a

# Clean old backups
ls -la backups/
```

---

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Setup SSL certificate with Let's Encrypt
- [ ] Enable firewall (ufw)
- [ ] Setup automatic security updates
- [ ] Configure backup schedule

### Firewall Setup

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Automatic Updates

```bash
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Cost Estimate

| Item | Monthly Cost |
|------|-------------|
| Hostinger VPS KVM 2 | ~$6-8 |
| Domain (yearly/12) | ~$1 |
| **Total** | **~$7-9/month** |
