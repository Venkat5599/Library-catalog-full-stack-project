# 📚 Library Book Catalog

A full-featured MERN stack library management system with a modern white & blue UI/UX design.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# From project root
npm run install-all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the Database

```bash
npm run seed
# or: cd server && npm run seed
```

### 4. Run the App

```bash
# Run both server and client
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:5000

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Member | alice@example.com | password123 |

---

## ✨ Features

### Member Features
- 🔍 **Book Catalog** — Search, filter, and browse all books
- 📖 **Borrow Books** — Borrow up to 5 books at once (14-day period)
- 🔄 **Renew Books** — Renew up to 2 times without visiting library
- ✅ **Return Books** — Return books online
- ⭐ **Reviews** — Rate and review books
- 📊 **Dashboard** — View active borrows, history, and fines
- 💰 **Fine Tracking** — Track overdue fines (₹5/day)

### Admin Features
- 📚 **Book Management** — Add, edit, delete books with cover images
- 👥 **Member Management** — View and manage all members
- 🔄 **Borrow Management** — Process returns and fine payments
- 📈 **Analytics Dashboard** — Charts for borrow trends and category stats
- ⚠️ **Overdue Tracking** — Monitor and action overdue books

---

## 🗂️ Project Structure

```
library-book-catalog/
├── server/                  # Express.js API
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   ├── utils/               # Seed script
│   └── server.js            # Entry point
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── shared/      # Layout, Sidebar
│   │   ├── context/         # AuthContext
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── UserDashboard.js
│   │   │   ├── BookCatalogue.js
│   │   │   ├── MyBorrows.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminBooks.js
│   │   │       ├── AdminUsers.js
│   │   │       └── AdminBorrows.js
│   │   ├── services/        # Axios API calls
│   │   └── styles/          # Global CSS (white & blue theme)
│   └── public/              # HTML template
└── package.json             # Root scripts
```

---

## 🎨 Design

- **Theme**: Clean white & blue (inspired by SmartClass reference)
- **Fonts**: Plus Jakarta Sans + Sora (via Google Fonts)
- **Icons**: Flaticons (CDN)
- **Charts**: Chart.js with react-chartjs-2
- **Notifications**: react-hot-toast

---

## 🔧 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/books | Get all books |
| POST | /api/books | Add book (admin) |
| POST | /api/borrows | Borrow a book |
| PUT | /api/borrows/return/:id | Return a book |
| PUT | /api/borrows/renew/:id | Renew a borrow |
| GET | /api/dashboard/admin | Admin stats |
| GET | /api/dashboard/user | User stats |
| POST | /api/reviews | Add review |
