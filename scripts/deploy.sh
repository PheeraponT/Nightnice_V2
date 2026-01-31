#!/bin/bash

# Nightnice Deployment Script
# Usage: ./scripts/deploy.sh [command]
# Commands: setup, deploy, update, logs, stop, backup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Copy .env.example to .env and configure it:"
        echo "  cp .env.example .env"
        echo "  nano .env"
        exit 1
    fi
}

# Initial setup on new server
setup() {
    log_info "Setting up Nightnice on new server..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        log_warn "Please log out and log back in for Docker permissions to take effect"
    fi

    # Check if docker-compose is available
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose not found. Please install Docker Compose."
        exit 1
    fi

    # Create SSL directory
    mkdir -p nginx/ssl

    # Generate self-signed certificate for initial setup
    if [ ! -f nginx/ssl/fullchain.pem ]; then
        log_info "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/CN=localhost"
        log_warn "Using self-signed certificate. Replace with real SSL certificate for production!"
    fi

    log_info "Setup complete! Next steps:"
    echo "  1. Copy .env.example to .env and configure it"
    echo "  2. Run: ./scripts/deploy.sh deploy"
}

# Deploy/start all services
deploy() {
    check_env
    log_info "Deploying Nightnice..."

    # Build and start containers
    docker compose build --no-cache
    docker compose up -d

    log_info "Waiting for services to start..."
    sleep 10

    # Check health
    if docker compose ps | grep -q "unhealthy\|Exit"; then
        log_error "Some services failed to start. Check logs:"
        echo "  docker compose logs"
        exit 1
    fi

    log_info "Deployment complete!"
    echo ""
    echo "Services running:"
    docker compose ps
}

# Update to latest version
update() {
    check_env
    log_info "Updating Nightnice..."

    # Pull latest code
    git pull origin main

    # Rebuild and restart
    docker compose build
    docker compose up -d

    # Clean up old images
    docker image prune -f

    log_info "Update complete!"
}

# View logs
logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker compose logs -f "$service"
    else
        docker compose logs -f
    fi
}

# Stop all services
stop() {
    log_info "Stopping Nightnice..."
    docker compose down
    log_info "All services stopped."
}

# Backup database
backup() {
    check_env
    source .env

    local backup_dir="backups"
    local backup_file="$backup_dir/nightnice_$(date +%Y%m%d_%H%M%S).sql"

    mkdir -p "$backup_dir"

    log_info "Backing up database..."
    docker compose exec -T postgres pg_dump -U "${DB_USER:-nightnice}" "${DB_NAME:-nightnice}" > "$backup_file"

    # Compress backup
    gzip "$backup_file"

    log_info "Backup saved to ${backup_file}.gz"

    # Keep only last 7 backups
    ls -t "$backup_dir"/*.gz 2>/dev/null | tail -n +8 | xargs -r rm
}

# Restore database
restore() {
    local backup_file=$1

    if [ -z "$backup_file" ]; then
        log_error "Please specify backup file to restore"
        echo "Usage: ./scripts/deploy.sh restore backups/nightnice_YYYYMMDD_HHMMSS.sql.gz"
        exit 1
    fi

    check_env
    source .env

    log_warn "This will overwrite the current database. Are you sure? (y/N)"
    read -r confirm
    if [ "$confirm" != "y" ]; then
        log_info "Restore cancelled."
        exit 0
    fi

    log_info "Restoring database from $backup_file..."

    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker compose exec -T postgres psql -U "${DB_USER:-nightnice}" "${DB_NAME:-nightnice}"
    else
        docker compose exec -T postgres psql -U "${DB_USER:-nightnice}" "${DB_NAME:-nightnice}" < "$backup_file"
    fi

    log_info "Database restored!"
}

# SSL certificate setup with Let's Encrypt
ssl() {
    local domain=$1

    if [ -z "$domain" ]; then
        log_error "Please specify domain name"
        echo "Usage: ./scripts/deploy.sh ssl your-domain.com"
        exit 1
    fi

    log_info "Setting up SSL for $domain..."

    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        log_info "Installing Certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi

    # Stop nginx temporarily
    docker compose stop nginx

    # Get certificate
    sudo certbot certonly --standalone -d "$domain" --non-interactive --agree-tos --email "admin@$domain"

    # Copy certificates
    sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" nginx/ssl/
    sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" nginx/ssl/
    sudo chown $USER:$USER nginx/ssl/*.pem

    # Restart nginx
    docker compose start nginx

    log_info "SSL certificate installed for $domain"
}

# Show help
help() {
    echo "Nightnice Deployment Script"
    echo ""
    echo "Usage: ./scripts/deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     Initial setup on new server"
    echo "  deploy    Build and start all services"
    echo "  update    Pull latest code and redeploy"
    echo "  logs      View container logs (optional: service name)"
    echo "  stop      Stop all services"
    echo "  backup    Backup database"
    echo "  restore   Restore database from backup"
    echo "  ssl       Setup SSL with Let's Encrypt"
    echo "  help      Show this help message"
}

# Main
case "${1:-help}" in
    setup)
        setup
        ;;
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    logs)
        logs "$2"
        ;;
    stop)
        stop
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    ssl)
        ssl "$2"
        ;;
    help|*)
        help
        ;;
esac
