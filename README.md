# Verdance — Premium Hair Oil Store (Full Stack)

A production-quality e-commerce application for a premium natural hair-care brand.

| Layer     | Stack |
| --------- | ----- |
| Frontend  | React 18 · TypeScript · Tailwind CSS · Vite · React Router |
| Backend   | Node.js · Express · TypeScript · Prisma ORM · JWT · Zod |
| Database  | MySQL 8 |

```
React frontend  →  API client (src/lib/api.ts)  →  Express + TS backend
                                                     →  services  →  Prisma  →  MySQL
```

---

## Run it

### 1 · Backend + database

**Fastest (no Docker, no MySQL install — SQLite):**

```bash
cd server
cp .env.example .env          # already set to file:./dev.db
npm install
npm run setup:dev             # build dev schema + create db + seed
npm run dev                   # API on http://localhost:4000  ·  docs /api/docs
```

**MySQL (production database / the project requirement):**

```bash
cd server
cp .env.example .env          # then set DATABASE_URL to your mysql:// URL
docker compose up -d          # MySQL on :3306  (or use your own)
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev:mysql
```

### 2 · Frontend

```bash
# from the repo root, in a second terminal
cp .env.example .env          # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                   # http://localhost:5173
```

Sign in with the seeded customer `customer@verdance.test` / `Customer123`,
or the admin `admin@verdance.test` / `ChangeMe_Admin123`.

> Without the backend running the frontend still renders, showing loading and
> error states; the guest cart falls back to `localStorage`.

---

## What the integration does

| Area | Before | After |
| ---- | ------ | ----- |
| Products | static `src/data/products.ts` | `GET /api/products` with server-side search / category / price / sort / pagination (`src/services/products.ts`) |
| Product page | static lookup | `GET /api/products/:slug` + `/related` + `/reviews`, with a review form for signed-in customers |
| Cart | `localStorage` only | **hybrid**: guests use `localStorage`; on login the guest cart is **merged** into the server cart (`POST /api/cart/merge`) which then becomes the source of truth with server-calculated totals |
| Auth | none | register / login / logout / refresh / me, JWT access token + rotating httpOnly refresh cookie (`AuthContext`) |
| Wishlist | local component state | persisted per user (`WishlistContext` → `/api/wishlist`) |
| Checkout | fake button | `/checkout` page → address selection, coupon validation, **server recalculates every total**, order created in a DB transaction, stock decremented, cart cleared → `/order/:orderNumber` confirmation |
| Account | none | `/account` — profile, saved addresses (CRUD + default), order history |
| **Admin panel** | none | `/admin` — dashboard, orders, products, customers, reviews, coupons, newsletter (see below) |
| Newsletter | fake success | `POST /api/newsletter/subscribe` |
| Password reset | none | `/account/reset-password` (request + token flows) |

All network calls go through **`src/lib/api.ts`** (envelope unwrapping, auth
header, automatic 401 → refresh → retry). Feature modules live in
**`src/services/*`** — components never call `fetch` directly.

---

## Frontend structure (additions)

```
src/
  lib/api.ts                 fetch client, token store, refresh-and-retry
  services/                  products, auth, cart, wishlist, addresses,
                             orders, misc (newsletter/coupons)
  context/
    AuthContext.tsx          session bootstrap + login/register/logout
    CartContext.tsx          hybrid guest/server cart + login merge
    WishlistContext.tsx      per-user wishlist
  types/api.ts               API DTO types
  pages/
    AccountPage.tsx          auth forms + dashboard (profile/orders/addresses)
    CheckoutPage.tsx         address + payment method (COD / card) + coupon + place order
    OrderConfirmationPage.tsx
    ResetPasswordPage.tsx
    admin/                   AdminDashboard / Orders / Products / Customers /
                             Reviews / Coupons / Newsletter
  components/admin/          AdminLayout (sidebar, admin-only guard) + shared UI
```

### Admin panel (`/admin`, admins only)

Guarded by `AdminLayout` — non-admins are redirected. Signed-in admins get an
"Admin panel" button on their account page.

| Screen | What it does |
| ------ | ------------ |
| **Dashboard** | revenue / orders / customers / low-stock cards, 30-day revenue bar chart, orders-by-status, recent orders, best sellers, low-stock list |
| **Orders** | search + status/payment filters; row → drawer to change fulfilment & payment status (marking a COD order *Delivered* auto-records the cash) |
| **Products** | catalogue table with inline stock edit and best-seller/featured toggles; full create/edit form — pricing, stock, flags, categories, ingredients, benefits, usage steps, images |
| **Customers** | list with search; activate / deactivate accounts |
| **Reviews** | pending / approved / all; approve, unpublish, delete (rating recomputed) |
| **Coupons** | list + create/edit (type, value, min spend, cap, usage limit, dates); deactivate |
| **Newsletter** | subscriber list, filterable by status |

The premium visual design, component library and all marketing sections are
unchanged — only the data layer was rewired.

### Product imagery

`ProductImage.imageUrl` is seeded with the render keys that `<ProductArt>`
already understands (`signature-front`, `repair-detail`, …), so the storefront
looks identical after integration. Swap in real photography by storing real URLs
and giving `ProductArt` an `<img>` branch — nothing else changes.

---

## Backend

See [`server/README.md`](server/README.md) for the full architecture, security
model, business rules, endpoint map and scripts.

---

## Scripts

Frontend (repo root): `npm run dev` · `npm run build` · `npm run preview`
Backend (`server/`): `npm run dev` · `npm run build` · `npm start` ·
`npm run prisma:migrate` · `npm run prisma:seed` · `npm run db:reset`

---

## Deployment shape

Frontend and backend deploy independently:

- Frontend → Vercel / Netlify (set `VITE_API_URL` to the API's public URL)
- Backend → Railway / Render / a VPS (`npm run build`, `npm run prisma:deploy`, `npm start`)
- Database → managed MySQL (set `DATABASE_URL`)

For cross-domain cookies in production set `COOKIE_SECURE=true` and serve both
over HTTPS; the refresh cookie is `SameSite=Lax` and scoped to `/api/auth`.
