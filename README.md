# 🏪 Store Rating Platform

A full-stack web application where users can rate stores, admins manage the system, and store owners track ratings in real-time.

---

## 🚀 Tech Stack

- **Frontend:** React.js (Hooks + Axios)
- **Backend:** Node.js (Express.js)
- **Database:** PostgreSQL (Sequelize ORM)
- **Authentication:** JWT (Role-based)

---

## 👥 User Roles & Access

### 🔹 Admin
- 📊 View dashboard (Total Users, Stores, Ratings)
- ➕ Create users (Admin / User / Store Owner)
- 🏪 Create stores & assign owners
- 👥 View all users (search, filter, pagination)
- 🔍 View user details with ratings

---

### 🔹 Normal User
- 🔐 Signup & Login
- 🔍 Search stores (name/address)
- ⭐ Rate stores (1–5)
- 🔄 Update rating (only one per store)
- 👀 View own rating + average rating

---

### 🔹 Store Owner
- 📊 View all ratings given to their store
- ⭐ See average rating
- 👥 Monitor users who rated

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based authorization middleware
- Protected frontend routes
- Password hashing using **bcrypt**
- API rate limiting + helmet security

---

## 📊 Features

- 🔍 Search & filter (Users & Stores)
- ↕️ Sorting (A–Z / Z–A / Rating)
- 📄 Pagination (Admin Users)
- ⭐ Rating system (1–5)
- 🔄 Update rating (Upsert logic)
- 👤 User detail view
- 🔐 Change password
- 🎨 Modern UI (Gradient + Cards + Responsive)
- 🔄 Refresh dashboard
- ⚡ Axios interceptors (auto token attach + error handling)

---

## 🗄️ Database Design

### Tables:
- **Users**
- **Stores**
- **Ratings**

### Relationships:
- User → Store (Owner)
- User → Rating
- Store → Rating

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd store-rating-platform

2️⃣ Backend Setup

cd backend
npm install
npm start

3️⃣ Frontend Setup

cd frontend
npm install
npm start

🔑 Environment Variables (.env)
Create .env file inside backend/:

PORT=5000
DB_NAME=store_rating
DB_USER=postgres
DB_PASS=your_password
JWT_SECRET=secret123

🔹 Admin

Email: admin@test.com
Password: Bibek@101

🔹 Store Owner

Email: owner@test.com
Password: Bibek@101

🔹 Normal User

Email: user@test.com
Password: Bibek@101
