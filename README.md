# GymFit – Gym Membership and Workout Tracker 🏋️‍♂️

A modern gym management web application where members buy membership plans, log daily workouts and body measurements, trainers build and assign targeted workout routines, and administrators track expiring memberships and analyze revenue reports using MongoDB aggregation.

---

## 🌟 Key Features & Requirements

### 1. User Roles & Authentication
- **Member**: Subscribes to membership plans, views assigned routines, logs daily workouts, tracks body measurements (weight, waist, chest, arms, body fat %), and inspects transformation progress.
- **Trainer**: Builds custom multi-day workout routines (with sets, reps, muscle targets, rest intervals, coach tips) and assigns them to gym members.
- **Admin**: Full administrative dashboard with plan CRUD operations, user role assignments, expiring membership date query filters, and revenue aggregation reports.
- **Security**: JWT authentication (`jsonwebtoken`), password hashing (`bcrypt`), and role-based route protection middleware.

### 2. Membership Plan CRUD & Subscriptions
- **Plan CRUD (Admin)**: Create, Read, Update, and Delete membership tiers (e.g. Starter Monthly, Quarterly Pro Split, Semi-Annual Elite, Annual VIP All-Access).
- **Member Subscriptions**: Purchase plans with start dates, duration calculations, automatic expiry date scheduling, and payment methods.
- **Seamless Extensions**: Purchasing while having an active plan automatically schedules the new plan from the existing expiry date.

### 3. Expiring-Membership List (Admin Date Query)
- Specialized date query filter tool querying MongoDB:
  - **Expiring within 7 Days**: `endDate: { $gte: now, $lte: now + 7d }`
  - **Expiring within 14 Days**: `endDate: { $gte: now, $lte: now + 14d }`
  - **Expiring within 30 Days**: `endDate: { $gte: now, $lte: now + 30d }`
  - **Already Expired**: `endDate: { $lt: now }`
  - **Custom Day Range**: Configurable dynamic day offsets.
- Displays days remaining countdown badges, member contact information, and membership status.

### 4. Trainer Workout Routine Assignment
- Multi-day workout routine builder (e.g. Day 1: Chest & Triceps, Day 2: Back & Biceps, Day 3: Legs & Core, Day 4: Shoulders & Abs).
- Exercise item fields: Exercise name, sets, reps, target muscle, rest interval (seconds), and coach execution tips.
- Direct member assignment selector and athlete routine view.

### 5. Daily Workout & Body Measurement Logging
- Members log workouts: session title, date, duration in minutes, calories burned, mood rating (1-5), and exercise sets/reps/weights lifted.
- **Physical Measurements**: Body weight (kg), body fat percentage (%), waist (cm), chest (cm), arms (cm), and hips (cm).

### 6. MongoDB Aggregation Reports
- **Member Progress Report**:
  - Aggregates total workouts, total training duration, calories burned, and mood rating.
  - Measurement progression timeline tracking initial baseline vs current stats with net delta calculation (e.g., -4.0 kg weight loss, -7.0 cm waist reduction).
  - Exercise volume and peak load aggregation (identifies top performed movements and PRs).
- **Revenue Report per Plan**:
  - Real-time MongoDB `$group` aggregation pipeline:
    - `$group` by plan ID calculating `totalRevenue`, `totalSubscriptions`, `activeCount`, `expiredCount`, and `avgAmountPaid`.
    - `$lookup` against `plans` collection.
    - `$unwind` plan metadata.
    - Monthly revenue trends aggregated by year and month.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express (`express`), MongoDB & Mongoose (`mongoose`), `dotenv`, `bcryptjs`, `jsonwebtoken`, `cors`, `morgan`.
- **Frontend**: React 18, React Router v6 (`react-router-dom`), Fetch API, Context API (`AuthContext`), Tailwind CSS, Lucide Icons (`lucide-react`), Vite.

---

## 📂 Project Structure

```
Antigravity/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & local mongod auto-manager
│   ├── controllers/
│   │   ├── authController.js         # Register, login, user directory & trainer assignment
│   │   ├── planController.js         # Plan CRUD operations
│   │   ├── subscriptionController.js # Subscriptions & expiring date queries
│   │   ├── routineController.js      # Trainer routine builder & assignment
│   │   ├── workoutLogController.js   # Daily workout & body measurement logs
│   │   └── analyticsController.js    # Member progress & Plan revenue aggregation
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verify and role authorization
│   ├── models/
│   │   ├── User.js                   # Member, Trainer, Admin schemas
│   │   ├── Plan.js                   # Gym membership plans
│   │   ├── Subscription.js           # Member subscriptions with start & expiry dates
│   │   ├── Routine.js                # Multi-day workout routines
│   │   └── WorkoutLog.js             # Workout volume & body measurements
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── planRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── routineRoutes.js
│   │   ├── workoutLogRoutes.js
│   │   └── analyticsRoutes.js
│   ├── seeds/
│   │   └── seedData.js               # Rich sample data with members, plans, routines & logs
│   ├── server.js                     # Express app entry & static frontend server
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, ProtectedRoute, StatCard, QuickLogin
│   │   ├── context/                  # AuthContext with Context API
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Role-adaptive dashboards
│   │   │   ├── PlansPage.jsx         # Plan CRUD (Admin) & Subscription checkout (Member)
│   │   │   ├── SubscriptionsPage.jsx # Expiring date query list & member subscription
│   │   │   ├── RoutinesPage.jsx      # Trainer routine builder & member routine viewer
│   │   │   ├── WorkoutLogsPage.jsx   # Daily workout & measurement logger
│   │   │   ├── ProgressReportPage.jsx# Aggregated member transformation analytics
│   │   │   ├── RevenueReportPage.jsx # Aggregated revenue report per plan
│   │   │   ├── UsersPage.jsx         # Admin user directory & trainer assignment
│   │   │   ├── LoginPage.jsx         # 1-Click fast demo buttons & authentication
│   │   │   ├── RegisterPage.jsx      # Member / Trainer registration
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js                # Centralized Fetch API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Database Seeding
To populate realistic sample plans, users, subscriptions, expiring memberships, and historical workout progression:
```bash
npm run seed
```
*(Or inside `backend`: `npm run seed`)*

### 2. Start Application
```bash
npm start
```
The application will launch on:
👉 **http://localhost:5000** (Full unified Web App + Backend API)

*(For separate Vite frontend development server, run `npm run dev:frontend` on port 3000)*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gymfit.com` | `password123` | Full dashboard, Plan CRUD, Expiring query tool, Revenue aggregation, User directory |
| **Trainer** | `trainer@gymfit.com` | `password123` | Coach dashboard, Assign routines to athletes, View client workout logs & progress |
| **Member** | `member@gymfit.com` | `password123` | Active membership timer, Assigned workout splits, Log workouts & body stats, Progress charts |

*(All login pages feature convenient **1-Click Demo Login** buttons for instant testing without typing credentials!)*

---

## 📡 Core API Reference

### Auth & Users
- `POST /api/auth/register` - Create member or trainer account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Current user profile
- `GET /api/auth/trainers` - List fitness trainers
- `GET /api/auth/members` - List gym members
- `PUT /api/auth/assign-trainer` - Assign trainer to member
- `GET /api/auth/users` - Admin user directory

### Membership Plans
- `GET /api/plans` - List active plans (or all for Admin)
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)

### Subscriptions & Date Queries
- `POST /api/subscriptions` - Purchase/subscribe to plan
- `GET /api/subscriptions/my` - Current member subscription & history
- `GET /api/subscriptions/expiring?days=7&mode=upcoming` - **Expiring-membership list using date query** (Admin)
- `GET /api/subscriptions/expiring?mode=expired` - Already expired subscriptions list
- `GET /api/subscriptions` - All subscriptions (Admin)

### Routines & Workouts
- `POST /api/routines` - Create & assign routine (Trainer/Admin)
- `GET /api/routines/my` - Current member's assigned routines
- `GET /api/routines/trainer` - Routines created by logged-in trainer
- `POST /api/workout-logs` - Log daily workout & body measurements
- `GET /api/workout-logs/my` - Member's logged workout history
- `GET /api/workout-logs/member/:id` - View athlete's workout logs

### Analytics (MongoDB Aggregation)
- `GET /api/analytics/revenue` - **Revenue report per plan using aggregation** (Admin)
- `GET /api/analytics/progress/:memberId?` - **Progress report per member using aggregation**
- `GET /api/analytics/dashboard` - Role-tailored metrics
