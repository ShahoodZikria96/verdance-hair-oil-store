# Verdance — Backend API

Production-oriented REST API for the Verdance hair-oil store.

**Stack:** Node.js · Express · TypeScript · Prisma ORM · MySQL · JWT auth · Zod validation · Helmet · rate-limiting · Pino logging · Swagger docs.

---

## Quick start

### Option A — zero setup (SQLite, no server, recommended for a first run)

```bash
cd server
cp .env.example .env            # already points DATABASE_URL at file:./dev.db
npm install
npm run setup:dev              # generates dev schema, creates SQLite db, seeds
npm run dev                    # http://localhost:4000  ·  docs at /api/docs
```

`setup:dev` derives a SQLite schema (`prisma/schema.dev.prisma`) from the
production MySQL schema automatically, so the two never drift.

### Option B — MySQL (the production database / project requirement)

```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL="mysql://verdance:verdance@localhost:3306/hair_oil_store"

docker compose up -d           # or point at your own MySQL
npm install
npm run prisma:migrate         # applies prisma/migrations
npm run prisma:seed
npm run dev:mysql              # regenerates the MySQL client, then starts
```

### Production

```bash
npm run build && npm start     # build regenerates the MySQL Prisma client
# migrations in CI/CD: npm run prisma:deploy
```

### Seeded accounts

| Role     | Email                     | Password           |
| -------- | ------------------------- | ------------------ |
| Admin    | `admin@verdance.test`     | `ChangeMe_Admin123`|
| Customer | `customer@verdance.test`  | `Customer123`      |

(Both configurable via `SEED_ADMIN_*` env vars. Change before any real deployment.)

Seeded coupons: `WELCOME10` (10% off, min $30, cap $20) · `RITUAL5` ($5 off over $40).

---

## Architecture

```
server/
  prisma/
    schema.prisma            20 models, enums, indexes
    migrations/              generated SQL migrations
    seed.ts                  idempotent dev seed
  src/
    config/env.ts            Zod-validated environment
    lib/                     prisma, logger, jwt, password, tokens
    middleware/              authenticate, authorize, validate, errorHandler,
                             rateLimiters, notFound
    validators/              Zod request schemas (one file per domain)
    repositories/            data-access helpers for the complex aggregates
    services/                business logic (auth, product, cart, order,
                             pricing, review, coupon, dashboard, …)
                             + email/EmailService  + payment/PaymentService
    controllers/             thin HTTP handlers (asyncHandler-wrapped)
    routes/                  express routers, mounted in routes/index.ts
    docs/openapi.ts          OpenAPI 3 description (served at /api/docs)
    app.ts / server.ts       app assembly + lifecycle
```

**Layering:** route → `validate()` → controller → service → (repository) → Prisma.
Controllers never contain business logic; services never touch `req`/`res`.

### Response envelope

```jsonc
// success
{ "success": true, "message": "...", "data": { }, "meta": { } }
// error
{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

Status codes: 200 / 201 / 400 / 401 / 403 / 404 / 409 / 422 / 429 / 500.
Stack traces and internals are never returned in `production`.

---

## Security

- **JWT** access token (15 min) — `Authorization: Bearer` **or** `accessToken` cookie.
- **Refresh token** — random, SHA-256-hashed in the DB, delivered as an httpOnly cookie
  scoped to `/api/auth`, **rotated** on every refresh, revoked on logout /
  password change / account deactivation.
- **bcrypt** (cost 12) password hashing — `passwordHash` is never serialised.
- **RBAC** — `authenticate` + `authorize('ADMIN')`; every `/api/admin/*` route is guarded.
- Helmet, configurable CORS allow-list with credentials, body-size limits,
  global + auth + write rate-limiters.
- All input validated with Zod; all DB access through Prisma (parameterised).
- Password reset tokens are single-use, 30-min TTL, and the endpoint does not
  reveal whether an email exists.

---

## Key business rules (server-authoritative)

| Concern      | Rule |
| ------------ | ---- |
| Cart totals  | Always recomputed from current DB prices. Frontend totals ignored. |
| Stock        | Decremented inside the order transaction with a guarded `updateMany` (`stockQuantity >= qty`); can never go negative. Restored on cancellation. |
| Orders       | Single `$transaction`: validate → decrement stock → bump coupon usage → create order + items → clear cart. Any failure rolls back. |
| Coupons      | Validated server-side (active window, usage limit, min spend, max discount). |
| Shipping     | Free ≥ `FREE_SHIPPING_THRESHOLD`, else `STANDARD_SHIPPING_FEE`. |
| Reviews      | One per user per product; `isVerified` only if the user actually ordered it; `isApproved` defaults false (admin moderation). Product `rating`/`reviewCount` are recomputed on approval. |
| Payment method | `COD` (Cash on Delivery, default) or `CARD`. Chosen at checkout, enforced server-side. |
| COD          | Order is `CONFIRMED` immediately with `paymentStatus = PENDING`; a `Payment{provider:"cod"}` row tracks it. Blocked when the total exceeds `COD_MAX_ORDER`. When an admin marks a COD order `DELIVERED`, `paymentStatus` auto-flips to `PAID` (cash collected). Optional `COD_FEE` surcharge. |
| Card         | `MockCardProvider` simulates an immediate capture → `PAID` + `CONFIRMED` (swap for Stripe/PayFast/JazzCash/Easypaisa via the `PaymentProvider` interface). |
| Address snapshot | Orders store a JSON copy of the shipping address so later edits don't rewrite history. |
| Order items  | Store `productName` / `sku` / `unitPrice` so historical orders survive product/price changes (`productId` is `SET NULL` on delete). |

---

## Payments

`src/services/payment/PaymentService.ts` defines a `PaymentProvider` interface and
ships two implementations:

| Provider | `capturesAtCheckout` | Behaviour |
| -------- | -------------------- | --------- |
| `CashOnDeliveryProvider` (`cod`) | `false` | records a PENDING payment; cash collected on delivery |
| `MockCardProvider` (`mock`) | `true` | simulates an instant capture → PAID |

`getPaymentProviderForMethod('COD' | 'CARD')` resolves the right provider for the
checkout. `GET /api/orders/payment-options` returns the enabled methods + rules
(COD fee, COD max order) for the frontend. Add **Stripe / PayFast / JazzCash /
Easypaisa** by implementing `PaymentProvider`, registering it under a key, and
pointing `PAYMENT_PROVIDER` at it — the order flow is untouched.

Env: `COD_ENABLED`, `COD_MAX_ORDER`, `COD_FEE`, `PAYMENT_PROVIDER`.

## Extensibility
- **Email** — `EmailService.ts` abstracts the transport (SMTP via nodemailer, or
  console logging when `SMTP_HOST` is unset). Templated helpers for welcome,
  order confirmation, status update, password reset.
- **Media** — only URLs/refs are stored (`ProductImage.imageUrl`). Point it at
  Cloudinary / S3 / Supabase later; the dev seed uses render keys consumed by the
  frontend's `<ProductArt>` component.

---

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | watch-mode server (tsx) |
| `npm run build` | compile to `dist/` |
| `npm start` | run `dist/server.js` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:deploy` | `prisma migrate deploy` (CI/prod) |
| `npm run prisma:seed` | run the seed |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:reset` | drop, re-migrate, re-seed |

---

## Endpoint map

`/api/auth` · `/api/products` (+ `/best-seller`, `/featured`, `/:slug/related`,
`/:slug/reviews`) · `/api/categories` · `/api/ingredients` · `/api/cart`
(+ `/merge`) · `/api/wishlist` · `/api/addresses` · `/api/orders` · `/api/reviews/me`
· `/api/coupons/validate` · `/api/newsletter` · `/api/admin/*`
(dashboard, analytics, orders, customers, reviews, coupons, newsletter).

Full detail + "try it out" at **`/api/docs`** (raw spec at `/api/docs.json`).
