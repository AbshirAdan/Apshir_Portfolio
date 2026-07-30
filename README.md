# Portfolio Management System

A production-ready full-stack portfolio CMS featuring a public responsive website and a secure administrative dashboard. Content is dynamically fetched from a Neon PostgreSQL database and managed through an Express.js REST API with Socket.IO real-time notification support.

---

## Technology Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management & Forms**: React Hook Form, Zod

### Backend
- **Runtime**: Node.js, Express.js
- **Database Access**: `pg` (PostgreSQL client pool)
- **Security**: Helmet, bcrypt (password hashing), CORS (dynamic multi-origin validation), Express Rate Limiter
- **Real-Time**: Socket.IO (WebSockets)
- **File Uploads**: Multer (file validation & storage)

---

## Features

- **Responsive Public Site**: Dynamic sections for profile, projects, skills, education, experience, certificates, and blogs.
- **Admin CMS Dashboard**: Fully secured CRUD interface for complete content control.
- **Visitor Analytics**: Active visitor and page view tracking stored directly in PostgreSQL.
- **Real-Time Notification Sync**: Live typing indicators, messages, and notification alerts via WebSockets.
- **Secure Authentication**: JWT-based session management, role-based route authorization, and password hashing using bcrypt.
- **Robust File Uploads**: Production-safe validation (size, MIME type) for assets, resumes, and project images.

---

## Folder Structure

```
Portfolio/
├── backend/                  # Node.js + Express MVC Backend
│   ├── config/               # Server configurations (database, sockets, mail, uploads)
│   ├── constants/            # Common enums (roles, statuses)
│   ├── controllers/          # Request handler functions
│   ├── database/             # Schema migrations and admin seed script
│   ├── middlewares/          # Security, auth, logger, upload, and error handlers
│   ├── models/               # Query representations and schemas
│   ├── repositories/         # Database access abstraction layers
│   ├── routes/               # API endpoint routing
│   ├── services/             # Core business logic (auth, email, message tracking)
│   ├── socket/               # Socket.IO connection and room event handlers
│   ├── tests/                # Jest unit test suite
│   ├── uploads/              # Local uploads destination folder
│   ├── utils/                # Utility classes (ApiError, ApiResponse)
│   ├── .env.example          # Template for backend secrets
│   ├── package.json          # Node dependencies and build scripts
│   └── server.js             # Main server startup file
│
├── frontend/                 # React + Vite Frontend
│   ├── public/               # Static public assets
│   ├── src/                  # Core application source
│   │   ├── apps/
│   │   │   ├── admin/        # Admin CMS modules and routes
│   │   │   └── public/       # Public site pages, components, and contexts
│   │   ├── shared/           # Common components, contexts, hooks, and services
│   │   ├── App.tsx           # Global routing entry point
│   │   └── main.tsx          # Client render entry point
│   ├── .env.example          # Template for frontend variables
│   ├── eslint.config.js      # Linter configuration rules
│   └── package.json          # Vite configurations and dependencies
```

---

## Installation & Local Setup

### 1. Clone the Repository and Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration
Copy the `.env.example` templates in both folders to create your `.env` configuration files:

#### Backend Setup (`backend/.env`)
Create a `backend/.env` file with the following variables:
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5000/api
JWT_SECRET=use_a_long_secure_secret_in_production
JWT_EXPIRATION=7d
ADMIN_FULL_NAME=Portfolio Admin
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=Admin@12345
```

#### Frontend Setup (`frontend/.env`)
Create a `frontend/.env` file with the following variables:
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Database Migration & Startup
The database migrations will run **automatically** when starting the backend server. Alternatively, run them manually:
```bash
cd backend
npm run migrate
```

### 4. Running the Project Locally
Run the development servers in two separate terminal windows:
```bash
# Terminal 1 — Start Backend Server (port 5000)
cd backend && npm run dev

# Terminal 2 — Start Frontend Client (port 5173)
cd frontend && npm run dev
```
- Public Portfolio: [http://localhost:5173](http://localhost:5173)
- Admin Login: [http://localhost:5173/signin](http://localhost:5173/signin) (Login with default admin seeded credentials above).
- API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## API Overview

### Public Endpoints (Unauthenticated)
- `GET /api/public/settings` - Fetch site settings
- `GET /api/public/profile` - Fetch developer profile bio
- `GET /api/public/projects` - Get project listings
- `GET /api/public/skills` - Get tech stack list
- `POST /api/public/contact` - Send contact messages with attachment support
- `POST /api/public/analytics` - Record page views and statistics

### Authenticated Admin Endpoints (JWT Required)
- `POST /api/auth/login` - Authenticate admin credentials
- `GET /api/dashboard/stats` - Retrieve CMS dashboard aggregate stats
- `CRUD /api/projects`, `/api/skills`, `/api/education`, `/api/experience` - Manage portfolio content

---

## Deployment Guide

### I. Neon PostgreSQL Database
1. Create a free PostgreSQL database instance on [Neon](https://neon.tech/).
2. Copy the connection string (`DATABASE_URL`). Ensure it has `sslmode=require` appended to the URL query parameter.

### II. Render Backend (Web Service)
1. Link your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service**, selecting the `backend` subdirectory as the root folder.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `FRONTEND_URL`: `https://apshir-portfolio.onrender.com` (Your Render static site domain)
   - `API_URL`: `https://abshir-portfolio-api.onrender.com/api`
   - `JWT_SECRET`: *(At least 32-character random string)*
   - `JWT_EXPIRATION`: `7d`
   - `ADMIN_FULL_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: *(Admin seeding credentials)*

### III. Render Frontend (Static Site)
1. Create a new **Static Site** on Render.
2. Select the `frontend` subdirectory as the root folder.
3. Configure settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://abshir-portfolio-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://abshir-portfolio-api.onrender.com`

---

## License

This project is licensed under the ISC License.
