#!/bin/bash

# TTMoney Setup Script
# This script sets up the entire application

set -e  # Exit on error

echo "🚀 TTMoney Setup Script"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo "${YELLOW}[1/6] Checking PostgreSQL Installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo "${RED}PostgreSQL not found. Please install PostgreSQL 12+ and add it to PATH${NC}"
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi
echo "${GREEN}✓ PostgreSQL found${NC}"
echo ""

# Create database
echo "${YELLOW}[2/6] Creating Database...${NC}"
psql -U postgres -c "DROP DATABASE IF EXISTS ttmoney;" 2>/dev/null || true
psql -U postgres -c "CREATE DATABASE ttmoney;" 2>/dev/null || {
    echo "${RED}Failed to create database. Ensure postgres user password is correct${NC}"
    exit 1
}
echo "${GREEN}✓ Database created${NC}"
echo ""

# Apply schema
echo "${YELLOW}[3/6] Applying Schema...${NC}"
cd "$(dirname "$0")"
if [ -f "docs/DATABASE_SCHEMA.md" ]; then
    # Extract SQL from markdown and run it
    sed -n '/^```sql/,/^```/p' docs/DATABASE_SCHEMA.md | grep -v '```' | psql -U postgres -d ttmoney
    echo "${GREEN}✓ Schema applied${NC}"
else
    echo "${RED}Database schema file not found${NC}"
    exit 1
fi
echo ""

# Install backend dependencies
echo "${YELLOW}[4/6] Installing Backend Dependencies...${NC}"
cd apps/backend
npm install --quiet
echo "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "${YELLOW}[5/6] Installing Frontend Dependencies...${NC}"
cd ../frontend
npm install --quiet
echo "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Create .env files
echo "${YELLOW}[6/6] Creating Environment Files...${NC}"
cd ..
cat > backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ttmoney
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev_secret_key_change_in_production
PORT=5000
NODE_ENV=development
EOF

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

echo "${GREEN}✓ Environment files created${NC}"
echo ""

echo "${GREEN}═══════════════════════════════════════${NC}"
echo "${GREEN}✓ Setup Complete!${NC}"
echo "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Start backend: cd apps/backend && npm run dev"
echo "2. Start frontend: cd apps/frontend && npm run dev"
echo "3. Visit http://localhost:3000"
echo ""
