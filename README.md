# Portfolio Management System

A full-stack portfolio CMS with a public website and secure admin dashboard. Content is stored in PostgreSQL and managed through a REST API.

## Features

- **Public portfolio website** — dynamic sections (hero, about, skills, projects, education, experience, certificates, blog, contact)
- **Admin CMS** — full CRUD for all content modules
- **Authentication** — JWT + bcrypt, role-based admin access
- **Visitor analytics** — page views tracked in PostgreSQL
- **File uploads** — project images, certificates, avatars, resume PDF, logos

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT, bcrypt |

## Project Structure

```
full stack/
├── backend/server/     # Active API (Express MVC)
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   └── database/migrations/
├── frontend/src/
│   ├── apps/admin/     # Admin dashboard
│   ├── apps/public/    # Public portfolio
│   └── shared/         # Shared services, components, context
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Installation

### 1. Clone and install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials and JWT secret

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Database setup

Create a PostgreSQL database, then start the backend — migrations run automatically on startup:

```bash
cd backend
npm run dev
```

Or run migrations manually:

```bash
npm run migrate
```

### 4. Run locally

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public portfolio |
| http://localhost:5173/admin/login | Admin dashboard |
| http://localhost:5000/api/health | API health check |

Default admin credentials (development seed — change in production):

- Email: `admin@portfolio.com`
- Password: set via `ADMIN_PASSWORD` in `.env`

## API Overview

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/settings` | Site configuration |
| GET | `/api/public/profile` | Public profile |
| GET | `/api/public/projects` | Published projects |
| GET | `/api/public/skills` | Skills list |
| POST | `/api/public/contact` | Contact form |
| POST | `/api/public/analytics` | Visitor tracking |

### Admin (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| CRUD | `/api/projects`, `/api/skills`, etc. | Content management |

All responses follow:

```json
{ "success": true, "message": "...", "data": {} }
```

Errors:

```json
{ "success": false, "message": "...", "error": null }
```

## Testing

```bash
# Backend unit tests
cd backend && npm test

# Backend API smoke tests (server must be running)
cd backend && npm run test:smoke

# Frontend component tests
cd frontend && npm test

# Production build
cd frontend && npm run build
```

## Security

- Helmet security headers
- CORS restricted to `FRONTEND_URL`
- Global rate limiting (100 req/15min)
- Auth rate limiting (20 req/15min)
- Input validation on all endpoints
- Parameterized SQL queries (no SQL injection)
- File upload MIME type + size validation
- Passwords hashed with bcrypt
- JWT secret via environment variable

## Deployment Checklist

Before deploying to production:

1. Set strong `JWT_SECRET` (32+ random characters)
2. Set secure `ADMIN_PASSWORD` and disable seed in production
3. Use `NODE_ENV=production`
4. Configure `FRONTEND_URL` to your production domain
5. Use a managed PostgreSQL instance (`DATABASE_URL`)
6. Use cloud storage for uploads (local disk is ephemeral on PaaS)
7. Enable HTTPS
8. Run `npm run test:smoke` against staging
9. Run `npm run build` for frontend

## Scripts Reference

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm start` | Production server |
| `npm run migrate` | Run database migrations |
| `npm test` | Jest unit tests |
| `npm run test:smoke` | API integration smoke tests |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript + production build |
| `npm test` | Vitest component tests |
| `npm run preview` | Preview production build |

## License

ISC
