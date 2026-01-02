# TTMoney - Getting Started Guide

## Project Overview
TTMoney is a full-stack personal expense management application with user authentication, expense tracking, budget monitoring, and detailed reports.

**Tech Stack:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express.js, PostgreSQL
- Authentication: JWT (jsonwebtoken), bcryptjs

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 12+ installed and running
- Git (optional)

### Step 1: Setup PostgreSQL Database

1. **Create the database:**
   ```bash
   createdb ttmoney
   ```

2. **Connect to the database and run the schema:**
   ```bash
   psql ttmoney < docs/DATABASE_SCHEMA.md
   ```
   Or manually run the SQL commands from [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

3. **Verify the tables were created:**
   ```bash
   psql ttmoney -c "\dt"
   ```

### Step 2: Setup Backend

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Create .env file from template:**
   ```bash
   cp .env.example .env
   ```

3. **Update .env with your PostgreSQL credentials:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ttmoney
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Step 3: Setup Frontend

1. **In a new terminal, navigate to frontend directory:**
   ```bash
   cd apps/frontend
   ```

2. **Create .env.local file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Update .env.local (optional, default is already set):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## Usage Guide

### Authentication
1. Visit `http://localhost:3000`
2. Click "Sign up" to create a new account or "Sign in" if you already have one
3. Choose your currency and timezone during registration
4. After login, you'll be redirected to the dashboard

### Adding Expenses
1. Click the "+ Add Expense" button on the dashboard
2. Fill in the expense details:
   - **Category**: Select from predefined categories
   - **Amount**: Enter the expense amount
   - **Date**: Pick the date of the expense
   - **Description**: Optional note about the expense
   - **Payment Method**: Choose cash, card, bank transfer, etc.
3. Click "Add Expense" to save

### Viewing Expenses
- **Recent Expenses**: Displayed in the table below the dashboard
- **By Month**: Use the month selector to filter expenses
- **By Category**: View spending distribution in the pie chart

### Setting Budgets
1. Go to "Budgets" section
2. Create a new budget for a category
3. Set the budget amount and alert threshold
4. Monitor your spending against budgets

### Viewing Reports
- **Monthly Report**: Summary of spending for the current month
- **Category Trends**: Track spending trends for specific categories over time
- **Summary**: Quick overview of total spent, transaction count, average spend

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (paginated)
- `GET /api/expenses/by-month?year=2024&month=12` - Get expenses by month
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/status?categoryId=xxx&year=2024&month=12` - Get budget status

### Reports
- `GET /api/reports/monthly?year=2024&month=12` - Get monthly report
- `GET /api/reports/trends?categoryId=xxx&months=6` - Get category trends
- `GET /api/reports/summary` - Get current month summary

## Project Structure

```
TTMONEY/
├── apps/
│   ├── frontend/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx      # Dashboard home page
│   │   │   │   ├── login/        # Login page
│   │   │   │   └── register/     # Registration page
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   ├── ExpenseList.tsx
│   │   │   │   ├── BudgetOverview.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── store/
│   │   │   │   └── authStore.ts  # Zustand auth state
│   │   │   └── lib/
│   │   │       └── apiClient.ts  # Axios client with auth
│   │   └── package.json
│   │
│   └── backend/                  # Express backend
│       ├── src/
│       │   ├── index.js          # Server entry point
│       │   ├── models/           # Database models
│       │   ├── controllers/      # Request handlers
│       │   ├── routes/           # API routes
│       │   ├── middleware/       # Auth middleware
│       │   └── config/
│       │       └── database.js   # PostgreSQL connection
│       └── package.json
│
├── docs/
│   └── DATABASE_SCHEMA.md        # Database schema definition
├── package.json                   # Monorepo root config
└── README.md
```

## Default Categories
When you register, these default categories are automatically created:
- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills & Utilities
- ⚕️ Health & Medical
- 📌 Other

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `psql -U postgres -d postgres -c "SELECT version();"`
- Check .env credentials match your PostgreSQL setup
- Ensure database `ttmoney` exists

### Port Already in Use
- Change PORT in .env (default 5000)
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### API Not Found (404)
- Ensure backend server is running on port 5000
- Check NEXT_PUBLIC_API_URL in frontend .env.local

### Authentication Issues
- Clear browser localStorage: DevTools > Storage > Clear
- Ensure JWT_SECRET in .env is set
- Check token expiration (default 7 days)

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in dev mode
2. **Database Migrations**: Manually run SQL from DATABASE_SCHEMA.md
3. **API Testing**: Use Postman or cURL with Bearer token for API testing
4. **Logs**: Check terminal output for backend logs and errors

## Next Steps

- Add email notifications for budget alerts
- Implement expense receipts/attachments
- Add expense tagging and search
- Create recurring expense automation
- Add data export (CSV, PDF)
- Setup automated backups
- Deploy to production (Vercel + Railway)

## Support & Issues

For bugs or issues, check:
1. Browser console for frontend errors (F12)
2. Terminal logs for backend errors
3. Database logs if connection issues

Good luck managing your expenses! 💰
