# APTO ATS (Applicant Tracking System)

A full-stack, AI-powered Applicant Tracking System that automatically parses resumes, extracts candidate data, scores matches against required skills, and presents everything in a modern, responsive dashboard.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│               http://localhost:5173                               │
│   ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐ │
│   │ Login    │ │ Overview │ │ Candidates │ │ Jobs / Settings  │ │
│   └──────────┘ └──────────┘ └────────────┘ └──────────────────┘ │
└────────────┬────────────────────┬────────────────────────────────┘
             │                    │
    /auth, /api/hono/*       /api/*
             │                    │
┌────────────▼──────────┐  ┌──────▼──────────────────────────┐
│  Hono.js Auth + CRUD  │  │  Python FastAPI (AI Worker)     │
│  http://localhost:3000 │  │  http://localhost:3001          │
│                        │  │                                 │
│  • JWT Auth (register, │  │  • Resume parsing (PDF/Image)  │
│    login, /auth/me)    │  │  • AI skill extraction         │
│  • Jobs CRUD           │  │  • Match scoring               │
│  • Candidates CRUD     │  │  • CSV export                  │
│  • SQLite + Drizzle ORM│  │  • candidates_data.json output │
└────────────────────────┘  └─────────────────────────────────┘
```

---

## 📋 Prerequisites

| Tool       | Version  | Purpose                      |
|------------|----------|------------------------------|
| **Node.js** | 20+     | Hono backend + Vite frontend |
| **Python**  | 3.10+   | AI resume processing worker  |
| **npm**     | 9+      | Package management           |
| **Git**     | 2.x     | Version control              |

> **Note:** This project uses **SQLite** (via `better-sqlite3`), so no external database server is required for local development.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ats-project.git
cd ats-project
```

### 2. Set Up the Hono Backend (Authentication + Data Layer)

```bash
cd my-hono-app

# Install dependencies
npm install

# Create .env file (or edit existing)
cp .env.example .env
# Ensure these variables are set:
#   JWT_SECRET=your-secret-key
#   PORT=3000

# Run database migrations (creates SQLite tables)
npx tsx migrate.ts

# Start the dev server (auto-reloads on changes)
npm run dev
```

The Hono server starts at **http://localhost:3000**.

### 3. Set Up the Python AI Worker

```bash
cd ats_backend_system

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn python-multipart Pillow google-generativeai

# Start the API server
python api.py
```

The Python server starts at **http://localhost:3001**.

### 4. Set Up the React Frontend

```bash
cd hrms-ui

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend starts at **http://localhost:5173**.

### 5. Create Your Admin Account

1. Open **http://localhost:5173** in your browser
2. Click **"Sign up"** to create an account
3. Log in with your credentials
4. You're in! 🎉

---

## 🐳 Docker Setup (Production)

### docker-compose.yml

```yaml
version: '3.8'

services:
  hono-backend:
    build:
      context: ./my-hono-app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=change-this-in-production
      - PORT=3000
    volumes:
      - hono-data:/app/data

  python-worker:
    build:
      context: ./ats_backend_system
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - resume-data:/app/resumes_to_process

  frontend:
    build:
      context: ./hrms-ui
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - hono-backend
      - python-worker

volumes:
  hono-data:
  resume-data:
```

### Hono Dockerfile (`my-hono-app/Dockerfile`)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx tsx migrate.ts
EXPOSE 3000
CMD ["npm", "start"]
```

### Python Dockerfile (`ats_backend_system/Dockerfile`)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir fastapi uvicorn python-multipart Pillow google-generativeai
EXPOSE 3001
CMD ["python", "api.py"]
```

### Frontend Dockerfile (`hrms-ui/Dockerfile`)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Running with Docker

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🔌 API Reference

### Hono Backend (`:3000`)

| Method | Endpoint                    | Auth | Description            |
|--------|-----------------------------|------|------------------------|
| POST   | `/auth/register`            | No   | Create new account     |
| POST   | `/auth/login`               | No   | Login, get JWT token   |
| GET    | `/auth/me`                  | Yes  | Get current user       |
| GET    | `/api/hono/jobs`            | Yes  | List all jobs          |
| POST   | `/api/hono/jobs`            | Yes  | Create a job           |
| PUT    | `/api/hono/jobs/:id`        | Yes  | Update a job           |
| DELETE | `/api/hono/jobs/:id`        | Yes  | Delete a job           |
| GET    | `/api/hono/candidates`      | Yes  | List all candidates    |
| POST   | `/api/hono/candidates`      | Yes  | Save a candidate       |
| DELETE | `/api/hono/candidates/:id`  | Yes  | Delete a candidate     |

### Python AI Worker (`:3001`)

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/upload`         | Upload resumes for AI processing     |
| GET    | `/api/candidates`     | Get processed candidates from JSON   |
| GET    | `/api/download-csv`   | Download CSV report                  |
| GET    | `/api/system-status`  | Check if AI worker is online         |
| GET    | `/api/jobs`           | Get in-memory jobs list              |

---

## 🔐 Environment Variables

### `my-hono-app/.env`

```env
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

> The `DATABASE_URL` in `.env` is for future PostgreSQL migration. Currently, the project uses SQLite locally via `better-sqlite3`.

---

## 📁 Project Structure

```
day4/
├── hrms-ui/                    # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── candidates/     # Extracted candidate sub-components
│   │   │   │   ├── types.ts
│   │   │   │   ├── score-utils.ts
│   │   │   │   ├── RankBadge.tsx
│   │   │   │   ├── ScoreBar.tsx
│   │   │   │   ├── CandidateMobileCard.tsx
│   │   │   │   └── UploadModal.tsx
│   │   │   ├── ui/             # ShadcnUI + custom components
│   │   │   ├── CandidatesTable.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── JobsTable.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── JobsContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── OverviewPage.tsx
│   │   │   ├── CreateJob.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── App.tsx
│   └── vite.config.ts
│
├── my-hono-app/                # Hono.js Backend (Auth + CRUD)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts        # SQLite connection
│   │   │   └── schema.ts       # Drizzle ORM schema
│   │   ├── routes/
│   │   │   ├── auth.ts         # JWT auth routes
│   │   │   ├── candidates.ts   # Candidates CRUD
│   │   │   └── jobs.ts         # Jobs CRUD
│   │   ├── middleware.ts       # Shared auth middleware
│   │   └── index.ts            # Server entry point
│   ├── migrate.ts              # Database migration script
│   ├── sqlite.db               # SQLite database file
│   └── drizzle.config.ts
│
└── ats_backend_system/         # Python AI Worker (FastAPI)
    ├── api.py                  # FastAPI server
    ├── main.py                 # AI pipeline (Gemini-powered)
    ├── export_results.py       # CSV export logic
    ├── candidates_data.json    # Processed candidates output
    └── resumes_to_process/     # Upload directory
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Frontend     | React 19, Vite 8, TailwindCSS 4, ShadcnUI     |
| Auth Backend | Hono.js, JWT, bcrypt                           |
| Data Layer   | Drizzle ORM, better-sqlite3                    |
| AI Worker    | Python, FastAPI, Google Gemini AI               |
| Charts       | Recharts                                       |
| Editor       | TipTap (Rich text for Job Descriptions)        |

---

## 🐛 Troubleshooting

| Issue                              | Solution                                                    |
|------------------------------------|-------------------------------------------------------------|
| Black page on browser refresh      | Ensure Vite proxy doesn't overlap SPA routes (fixed in v2)  |
| Upload not showing data in table   | Python API must return `candidates` array (fixed in v2)     |
| `Unauthorized` on page load        | Token expired — log out and log in again                    |
| Python AI worker fails to start    | Ensure `venv` is activated and dependencies installed       |
| Port already in use                | Kill existing processes: `npx kill-port 3000 3001 5173`     |
| SQLite "table not found" error     | Run `npx tsx migrate.ts` in `my-hono-app/`                  |

---

## 📄 License

This project is proprietary software developed for APTO Solution.
