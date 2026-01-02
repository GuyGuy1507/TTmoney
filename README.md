# 💰 Expense Manager - Personal Finance Management App

A modern, full-stack personal expense management application built with **Next.js**, **React**, **Tailwind CSS**, **Node.js/Express**, and **PostgreSQL**.

## 🎯 Features

- **Dashboard**: Visual overview of spending, budget tracking, and financial summary
- **Income & Expense Tracking**: Complete financial management with income sources
- **Smart AI Categorization**: AI automatically suggests categories based on descriptions
- **AI Financial Insights**: Personalized financial advice and spending analysis
- **Budget Management**: Set monthly budgets and monitor spending limits
- **Multi-Currency Support**: USD, EUR, GBP, JPY, VND with proper formatting
- **Category Management**: Organize expenses by customizable categories
- **Analytics & Reports**: Charts, graphs, and detailed spending reports
- **Authentication**: Secure user authentication with JWT
- **Free Deployment**: One-click deployment to free hosting services
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📁 Project Structure

```
expense-manager/
├── apps/
│   ├── frontend/          # Next.js React application
│   │   ├── src/
│   │   │   ├── app/       # Next.js app router
│   │   │   ├── components/# React components
│   │   │   ├── styles/    # Global styles
│   │   │   └── utils/     # Utility functions
│   │   ├── package.json
│   │   └── tailwind.config.js
│   └── backend/           # Express.js API server
│       ├── src/
│       │   ├── routes/    # API routes
│       │   ├── models/    # Database models
│       │   ├── controllers/# Business logic
│       │   ├── middleware/# Express middleware
│       │   ├── config/    # Configuration
│       │   └── index.js   # Server entry point
│       ├── package.json
│       └── .env.example
├── package.json           # Root workspace configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/expense-manager.git
cd expense-manager
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Setup Frontend**
```bash
cd apps/frontend
npm install
```

4. **Setup Backend**
```bash
cd ../backend
npm install
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

5. **Setup Database**
```bash
# Create PostgreSQL database
createdb expense_db

# Run migrations (create tables)
npm run migrate:up
```

6. **Start Development Servers**
```bash
# From root directory
npm run dev
# or run separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Zustand** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budget
- `GET /api/budget` - Get budget info
- `PUT /api/budget` - Update budget
- `GET /api/budget/status` - Get budget status

### Reports
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/category` - Category breakdown
- `GET /api/reports/trends` - Spending trends

## 🗄️ Database Schema

See `docs/DATABASE_SCHEMA.md` for detailed schema documentation.

## 📸 Screenshots

Coming soon...

## 🧪 Testing

```bash
# Frontend tests
cd apps/frontend
npm test

# Backend tests
cd apps/backend
npm test
```

## 🚀 Free Deployment (Recommended)

Get your app live instantly with completely free hosting:

### **Automated Deployment (Easiest)**
```bash
# Run the interactive deployment assistant
./scripts/deploy.sh

# Choose option 7 for full automated deployment
```

### **Services Used (All Free):**
- **Database**: Supabase PostgreSQL (500MB free)
- **Backend**: Railway (512MB RAM, free tier)
- **Frontend**: Vercel (unlimited deployments, free)

### **Manual Deployment Steps:**

#### 1. **Database Setup (Supabase)**
```bash
# 1. Go to supabase.com and create account
# 2. Create new project
# 3. Copy connection string from project settings
# 4. Update apps/backend/.env.production with your values
# 5. Run database setup
npm install -g pg
node scripts/setup-supabase.js
```

#### 2. **Backend Deployment (Railway)**
```bash
# 1. Go to railway.app and connect GitHub
# 2. Create new project from your repository
# 3. Configure settings:
#    - Root Directory: apps/backend
#    - Environment Variables: Copy from .env.production
# 4. Deploy automatically
```

#### 3. **Frontend Deployment (Vercel)**
```bash
# 1. Go to vercel.com and connect GitHub
# 2. Import your repository
# 3. Configure project:
#    - Framework: Next.js
#    - Root Directory: apps/frontend
#    - Environment Variable:
#      NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
# 4. Deploy
```

### **Legacy Deployment Options**

#### Frontend (Vercel recommended)
```bash
cd apps/frontend
npm run build
# Push to Vercel for automatic deployment
```

#### Backend (Heroku/Railway recommended)
```bash
cd apps/backend
npm run build
npm start
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see `LICENSE` file for details.

## 💡 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML predictions
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Receipt scanning (OCR)
- [ ] Recurring expenses
- [ ] Shared budgets with family
- [ ] Export to PDF/Excel
- [ ] Dark mode
- [ ] Push notifications

## 📧 Support

For support, email support@expensemanager.com or create an issue on GitHub.

---

**Made with ❤️ for better personal finance management**
