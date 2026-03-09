# Soul Studio

Monorepo for a salon management platform with:
- `Backend` (Node.js + Express + MongoDB)
- `Frontend` (React + Vite admin/receptionist app)
- `CustomerFrontend` (React + Vite customer app)

## Project Structure

```text
ParthBuildersF/
  Backend/            # API server
  Frontend/           # Admin/receptionist web app
  CustomerFrontend/   # Customer-facing web app
  scripts/dev-all.mjs # Starts all 3 apps together
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (recommended)
- MongoDB instance (local or cloud)

## Environment Setup

Create a `.env` file inside `Backend/`:

```env
# Required
MONGO_DB_URL=mongodb://127.0.0.1:27017/parthbuildersf

# Optional but recommended
PORT=3000
PORT_FALLBACK_ATTEMPTS=20
SESSION_SECRET=change_this_secret
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
ALLOW_LOCALHOST_CORS=true

# Email (for OTP / welcome email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_app_password
SMTP_FROM=your_email@example.com
CUSTOMER_APP_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

Notes:
- `MONGO_DB_URL` is required for backend startup.
- Frontends proxy API calls to backend automatically through Vite config.

## Install Dependencies

From project root:

```bash
npm install --prefix Backend
npm install --prefix Frontend
npm install --prefix CustomerFrontend
```

You can also install root dependencies (not required currently, but safe):

```bash
npm install
```

## Run in Development

### Option 1: Start all apps together (recommended)

From project root:

```bash
npm run dev
```

Default ports:
- Backend: `3000` (auto-falls forward if busy)
- Customer frontend: `5173`
- Admin frontend: `5174`

`scripts/dev-all.mjs` auto-resolves free ports and points both frontends to the running backend.

### Option 2: Start each app separately

In separate terminals:

```bash
# Terminal 1
npm --prefix Backend run dev

# Terminal 2
npm --prefix CustomerFrontend run dev

# Terminal 3
npm --prefix Frontend run dev
```

## Build

From project root:

```bash
npm run build
```

Or build individually:

```bash
npm run build:admin
npm run build:customer
```

## Quick Health Check

After backend starts, open:

`http://localhost:3000/ping`

Expected response:

`PONG`
