# TTMoney - Quick Reference

## 🚀 Start Application (3 Steps)

### 1. Setup Database
```bash
createdb ttmoney
psql ttmoney < docs/DATABASE_SCHEMA.md
```

### 2. Start Backend
```bash
cd apps/backend
npm install  # First time only
npm run dev  # Port 5000
```

### 3. Start Frontend
```bash
cd apps/frontend
npm install  # First time only
npm run dev  # Port 3000
```

Visit `http://localhost:3000` → Sign up → Start tracking expenses! 💰

---

## 📝 Sample API Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "currency": "USD",
    "timezone": "UTC"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Add Expense (requires auth token)
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category-uuid",
    "amount": 25.50,
    "description": "Lunch",
    "date": "2024-12-27",
    "paymentMethod": "card"
  }'
```

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `apps/frontend/src/app/page.tsx` | Main dashboard |
| `apps/backend/src/index.js` | Server entry point |
| `docs/DATABASE_SCHEMA.md` | Database setup |
| `GETTING_STARTED.md` | Full setup guide |
| `PROJECT_COMPLETION.md` | Detailed completion summary |

---

## 🔑 Default Login

After registration, use your credentials:
- Email: `your-email@example.com`
- Password: `your-password`

---

## 📱 Default Categories

Automatically created on signup:
- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills & Utilities
- ⚕️ Health & Medical
- 📌 Other

---

## 🔒 Environment Setup

### Backend .env
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ttmoney
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🛠️ Common Commands

```bash
# Frontend
cd apps/frontend
npm run dev         # Dev server
npm run build       # Production build
npm run lint        # Check errors

# Backend
cd apps/backend
npm run dev         # Dev server with hot reload
npm run start       # Start production
```

---

## 📊 API Response Examples

### Get Expenses
```json
{
  "expenses": [
    {
      "id": "uuid",
      "amount": 25.50,
      "description": "Lunch",
      "date": "2024-12-27",
      "category_name": "Food & Dining",
      "category_color": "#ff6b6b"
    }
  ],
  "count": 1
}
```

### Get Budget Status
```json
{
  "budgeted": 500,
  "spent": 325,
  "remaining": 175,
  "percentage": 65
}
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process |
| Database error | Verify PostgreSQL running, check credentials |
| Module not found | Run `npm install` in the directory |
| TypeScript error | Save file again, Next.js rebuilds |
| 401 Auth error | Token expired, log out and login again |

---

## 📞 Support

- Check `GETTING_STARTED.md` for detailed setup
- See `PROJECT_COMPLETION.md` for architecture
- Review `DATABASE_SCHEMA.md` for data structure
- Check browser console for frontend errors (F12)
- Check terminal for backend errors

---

## ✨ Features at a Glance

✅ User Authentication (JWT + bcryptjs)
✅ Expense Tracking (Add, Edit, Delete)
✅ Category Management (7 default + custom)
✅ Budget Monitoring (Per-category alerts)
✅ Analytics & Reports (Monthly, trends)
✅ Responsive Design (Mobile-friendly)
✅ Dark Mode Ready (Tailwind CSS)
✅ Real-time Updates (API integration)

---

**Happy expense tracking! 💸**
