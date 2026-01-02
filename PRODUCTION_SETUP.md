# TTMoney - Production Setup Guide

## ⚠️ Important: Database Setup Required

The application is fully built and running in memory/mock mode. To use it with real data persistence, you need to set up PostgreSQL.

---

## PostgreSQL Installation

### Windows

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14+ installer

2. **Install PostgreSQL**
   - Run the installer
   - **Important**: Remember the password you set for the `postgres` user
   - Install to default location (usually `C:\Program Files\PostgreSQL\15`)
   - Ensure "Add PostgreSQL bin directory to PATH" is checked during installation

3. **Verify Installation**
   ```powershell
   psql --version
   ```
   Should show version number

4. **Create Database**
   ```powershell
   # Run PowerShell as Administrator
   psql -U postgres -h localhost
   # Enter password when prompted
   
   # Then run:
   CREATE DATABASE ttmoney;
   \q
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb ttmoney
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

sudo -u postgres createdb ttmoney
```

---

## Apply Database Schema

Once PostgreSQL is running and `ttmoney` database is created:

### Windows PowerShell

```powershell
cd D:\VScode\TTMONEY
powershell -ExecutionPolicy Bypass -File setup.ps1 -PostgresPassword "your_postgres_password"
```

### macOS/Linux Bash

```bash
cd ~/path/to/TTMONEY
bash setup.sh
```

Or manually:

```bash
# Extract SQL from docs/DATABASE_SCHEMA.md and run:
psql -U postgres -d ttmoney < schema.sql
```

---

## Verify Database Setup

```bash
# Connect to database
psql -U postgres -d ttmoney

# Check tables
\dt

# Should show 8 tables:
# - users
# - categories
# - expenses
# - budgets
# - tags
# - expense_tags
# - savings_goals
# - audit_log
```

---

## Create Environment Files

### Backend (.env)

Create `apps/backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ttmoney
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secret_key_here_at_least_32_chars_long
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Start Development Servers

### Terminal 1 - Backend
```bash
cd apps/backend
npm install  # First time only
npm run dev  # http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd apps/frontend
npm install  # First time only
npm run dev  # http://localhost:3000
```

### Terminal 3 - Database Monitor (Optional)
```bash
psql -U postgres -d ttmoney

# Common commands:
# \dt                 - List tables
# \d users            - Show users table structure
# SELECT COUNT(*) FROM users;  - Count users
# \q                  - Quit
```

---

## Testing the Application

1. **Open Browser**: http://localhost:3000
2. **Sign Up**:
   - Email: test@example.com
   - Password: password123
   - Currency: USD
   - Timezone: UTC
3. **Create Expense**:
   - Click "+ Add Expense"
   - Category: Food & Dining
   - Amount: 25.50
   - Date: Today
   - Click "Add Expense"
4. **View Dashboard**:
   - Dashboard shows expenses
   - Sidebar shows navigation
   - Charts update with data

---

## Troubleshooting

### PostgreSQL Connection Failed

```
ERROR: FATAL: no pg_hba.conf entry for host...
```

**Solution**:
1. Verify PostgreSQL is running: `psql -U postgres -h localhost`
2. Check password in .env matches what you set during installation
3. Restart PostgreSQL service

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**:
```powershell
# Windows - kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in apps/backend/.env to 5001
```

### Database Schema Issues

If tables don't exist:

```bash
# Manually run schema
psql -U postgres -d ttmoney << EOF
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  profile_picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ... (see docs/DATABASE_SCHEMA.md for full schema)
EOF
```

---

## Production Deployment

### Frontend (Vercel)

```bash
cd apps/frontend
npm run build
# Deploy to Vercel: https://vercel.com

# Update NEXT_PUBLIC_API_URL to production backend URL
```

### Backend (Railway/Heroku)

```bash
cd apps/backend
# Create account on Railway.app or Heroku
# Set environment variables for production database
# Deploy using CLI
```

### Database (Managed Services)

Options:
- **Managed PostgreSQL**: Railway, Heroku Postgres, AWS RDS, DigitalOcean
- Use connection string: `postgresql://user:password@host:port/database`

---

## API Documentation

All API endpoints require JWT token in Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses
- `GET /api/expenses/by-month?year=2024&month=12` - Filter by month
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - List categories
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - List budgets
- `GET /api/budgets/status?categoryId=X&year=2024&month=12` - Budget status
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Reports
- `GET /api/reports/monthly?year=2024&month=12` - Monthly report
- `GET /api/reports/trends?categoryId=X&months=6` - Spending trends
- `GET /api/reports/summary` - Current month summary

---

## Default Categories

Automatically created on user signup:

- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills & Utilities
- ⚕️ Health & Medical
- 📌 Other

---

## Project Structure

```
TTMONEY/
├── apps/
│   ├── frontend/          # Next.js 14 React app
│   └── backend/           # Express.js API server
├── docs/
│   └── DATABASE_SCHEMA.md # PostgreSQL schema
├── setup.ps1              # Windows setup script
├── setup.sh               # Linux/macOS setup script
└── [documentation]
```

---

## Next Steps

1. **Install PostgreSQL** (see above)
2. **Create database and schema** (setup.ps1 or setup.sh)
3. **Configure .env files** (backend and frontend)
4. **Start servers** (npm run dev in both terminals)
5. **Test application** (http://localhost:3000)
6. **Deploy to production** (Vercel + Railway)

---

## Support

- Check logs: `npm run dev` output in terminal
- Database issues: `psql -U postgres -d ttmoney -c "\dt"`
- API errors: Browser DevTools (F12) → Network tab
- Backend errors: Terminal running `npm run dev`

---

**Questions?** Review GETTING_STARTED.md, README.md, or DATABASE_SCHEMA.md
