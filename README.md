# Designs of Dreams (DOD) — Monorepo

Production-ready e-commerce platform with a customer storefront and admin dashboard.

## Apps

| App | Path | Port | Description |
|-----|------|------|-------------|
| **DOD Shop** | `dodshop/` | 3000 | Customer-facing PWA storefront |
| **Admin Dashboard** | `Dashbord/` | 3002 | Admin panel for catalog, orders, CMS |
| **Database** | `packages/database/` | — | Shared Prisma schema & client |

## Quick Start

```bash
# Install dependencies (from repo root)
npm install

# Generate Prisma client
cd packages/database && npx prisma generate && cd ../..

# Copy env files and fill in values
cp .env.example .env
cp dodshop/.env.example dodshop/.env.local
cp Dashbord/.env.example Dashbord/.env.local

# Push database schema
cd packages/database && npx prisma db push && cd ../..

# Seed database (optional)
cd packages/database && npm run db:seed && cd ../..

# Run both apps (separate terminals)
cd dodshop && npm run dev
cd Dashbord && npm run dev
```

## Production Build

```bash
npm install
cd packages/database && npx prisma generate && cd ../..
cd dodshop && npm run build
cd ../Dashbord && npm run build
```

## Environment Variables

See `.env.example` in the repo root and each app folder.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Prisma** + PostgreSQL
- **Tailwind CSS 4**
- **Zustand** (state)
- **Cloudinary** (image uploads — admin)
- **PWA** (dodshop)

## Deployment

Deploy `dodshop` and `Dashbord` as separate Vercel projects. Both share the same `DATABASE_URL`. Set `JWT_SECRET` to a strong random string (32+ bytes) in production.
