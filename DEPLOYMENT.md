# Deployment guide

The app has **three parts** that deploy separately:

| Part | What it is | Good hosts |
| ---- | ---------- | ---------- |
| Frontend | Vite static SPA (`/dist`) | **Vercel**, Netlify, Cloudflare Pages |
| Backend | Node/Express + Prisma API (`/server`) | **Railway**, Render, Fly.io, a VPS — *or* Vercel serverless |
| Database | MySQL 8 | Railway, Render, PlanetScale, Aiven, AWS RDS |

> ⚠️ **The local `DATABASE_URL="file:./dev.db"` (SQLite) only works on your machine.**
> Every cloud host has an ephemeral/read-only filesystem, so production **must** use a
> hosted **MySQL** database. The Prisma schema (`server/prisma/schema.prisma`) is already
> MySQL — you just point `DATABASE_URL` at the hosted one and run `prisma migrate deploy`.

---

## Recommended setup — Frontend on Vercel, Backend + DB on Railway

Express + Prisma + a persistent DB connection is a poor fit for serverless (cold starts,
connection storms). Running the API as a normal always-on service is simpler and cheaper
to reason about.

### 1 · Database (Railway MySQL)

1. Create a Railway project → **New → Database → MySQL**.
2. Copy its connection string (Railway shows a `mysql://…` URL). This is your
   `DATABASE_URL`.

*(PlanetScale, Render, Aiven, RDS all work the same way — any `mysql://` URL.)*

### 2 · Backend (Railway service from `/server`)

1. In the same Railway project → **New → GitHub Repo** → pick this repo.
2. **Settings → Root Directory:** `server`
3. **Settings → Build Command:** `npm run build`
   **Settings → Custom Start Command:** `npm run start:prod`
   *(`start:prod` runs `prisma migrate deploy` then boots the server — migrations
   apply automatically on every release.)*
4. **Variables** (Railway → Variables):

   ```
   NODE_ENV=production
   DATABASE_URL=${{ MySQL.MYSQL_URL }}      # reference the DB service, or paste the mysql:// url
   JWT_ACCESS_SECRET=<64+ random hex chars>
   JWT_REFRESH_SECRET=<a different 64+ random hex chars>
   FRONTEND_URL=https://your-frontend.vercel.app
   CORS_ORIGIN=https://your-frontend.vercel.app
   COOKIE_SECURE=true
   COOKIE_SAMESITE=none          # frontend and API are on different domains
   STORE_CURRENCY=USD
   FREE_SHIPPING_THRESHOLD=50
   STANDARD_SHIPPING_FEE=5
   COD_ENABLED=true
   COD_MAX_ORDER=500
   COD_FEE=0
   SUPPORTED_CURRENCIES=USD,PKR,EUR,GBP,AED
   FX_RATES={"USD":1,"PKR":278,"EUR":0.92,"GBP":0.79,"AED":3.67}
   SEED_ADMIN_EMAIL=you@yourdomain.com
   SEED_ADMIN_PASSWORD=<a strong password>
   # optional email:
   SMTP_HOST= SMTP_PORT=587 SMTP_USER= SMTP_PASSWORD= SMTP_FROM="Verdance <no-reply@yourdomain>"
   ```

   Generate a secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

5. Deploy. Note the public URL, e.g. `https://verdance-api.up.railway.app`.
6. **Seed once** (optional — creates the admin + demo catalogue). From your machine:
   ```bash
   cd server
   DATABASE_URL="<prod mysql url>" SEED_ADMIN_EMAIL="you@you.com" SEED_ADMIN_PASSWORD="<strong>" npm run prisma:seed
   ```
   …or run it as a one-off Railway command. **Change the seeded admin password.**

### 3 · Frontend (Vercel)

1. **vercel.com → Add New → Project → import this repo.**
2. **Root Directory:** leave as the repo root (`/`).
3. Vercel auto-detects **Vite**. Build command `npm run build`, output `dist`
   (already pinned in `vercel.json`; the SPA rewrite is there too).
4. **Environment Variables:**
   ```
   VITE_API_URL=https://verdance-api.up.railway.app/api
   ```
   (your backend URL from step 2.6, **with `/api` on the end**).
5. Deploy. Open the site, sign in with the seeded admin, and go to `/admin`.

### 4 · Wire the two together

After both are live, make sure the backend's `FRONTEND_URL` / `CORS_ORIGIN` exactly
match the Vercel URL (including `https://`, no trailing slash) and redeploy the backend.
`CORS_ORIGIN` accepts a comma-separated list if you have a preview domain too.

---

## Alternative — everything on Vercel (two projects)

Works, with caveats: serverless cold starts, the in-memory rate-limiter resets per
invocation, and you still need an **external MySQL** (use a serverless-friendly one such
as PlanetScale, or add `?connection_limit=1` to the URL, or put Prisma Accelerate /
PgBouncer in front).

Files are already in the repo: `server/api/index.ts` (function entry) and
`server/vercel.json` (routes everything to it).

### Backend — Vercel project B

1. **Add New → Project → same repo.**
2. **Root Directory:** `server`
3. **Build Command:** `npm run vercel-build`
   (= `prisma generate && prisma migrate deploy`)
4. Same environment variables as the Railway list above, plus:
   ```
   DATABASE_URL=<hosted mysql, serverless-friendly>
   ```
5. Deploy → note the URL, e.g. `https://verdance-api.vercel.app`.
   All routes are served under `/api/...` (health check: `/api/health`, docs: `/api/docs`).

### Frontend — Vercel project A

Same as the recommended flow, with
`VITE_API_URL=https://verdance-api.vercel.app/api`.

### Keeping it same-origin (optional, avoids `SameSite=none`)

Instead of pointing `VITE_API_URL` at the backend domain, proxy it through the frontend.
In the **frontend** `vercel.json` add a rewrite *before* the SPA catch-all:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://verdance-api.vercel.app/api/:path*" },
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

Then set `VITE_API_URL=/api` and on the backend keep `COOKIE_SAMESITE=lax`
(`CORS_ORIGIN` can be the same Vercel domain). The browser now sees one origin.

---

## Checklist

- [ ] Hosted **MySQL** created, `DATABASE_URL` copied
- [ ] Backend deployed; `GET <api>/health` returns `{ "success": true }`
- [ ] `prisma migrate deploy` ran (part of the start/build command)
- [ ] DB seeded once (admin account created, password changed)
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are long and unique
- [ ] `COOKIE_SECURE=true`; `COOKIE_SAMESITE=none` **or** same-origin proxy
- [ ] `CORS_ORIGIN` / `FRONTEND_URL` = exact frontend URL
- [ ] Frontend deployed with `VITE_API_URL` pointing at `<api>/api`
- [ ] Log in, load `/shop`, place a test order, open `/admin`

## Custom domains

Put the frontend on `store.yourdomain.com` and the API on `api.yourdomain.com`.
Because they share `yourdomain.com`, you can set `COOKIE_SAMESITE=lax` **and**
`COOKIE_DOMAIN=.yourdomain.com` so the session cookie is shared — no `SameSite=none`
needed.
