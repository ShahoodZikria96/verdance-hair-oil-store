import 'dotenv/config';
import { z } from 'zod';

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : v === 'true' || v === '1'));

const num = (def: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? def : Number(v)))
    .pipe(z.number());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: num(4000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET too short'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET too short'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  COOKIE_SECURE: bool(false),
  COOKIE_DOMAIN: z.string().optional(),
  // Use "none" when the frontend and API are on different domains (requires COOKIE_SECURE=true).
  COOKIE_SAMESITE: z.enum(['lax', 'none', 'strict']).default('lax'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  STORE_CURRENCY: z.string().default('USD'),
  FREE_SHIPPING_THRESHOLD: num(50),
  STANDARD_SHIPPING_FEE: num(5),

  // Cash on Delivery
  COD_ENABLED: bool(true),
  COD_MAX_ORDER: num(500),
  COD_FEE: num(0),

  // Multi-currency. STORE_CURRENCY is the BASE all product prices are stored in.
  // FX_RATES maps currency code -> units per 1 base unit.
  SUPPORTED_CURRENCIES: z.string().default('USD,PKR,EUR,GBP,AED'),
  FX_RATES: z
    .string()
    .default(
      '{"USD":1,"PKR":278,"EUR":0.92,"GBP":0.79,"AED":3.67,"INR":83,"SAR":3.75,"CAD":1.35}',
    ),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@verdance.test'),
  SEED_ADMIN_PASSWORD: z.string().default('ChangeMe_Admin123'),
  SEED_ADMIN_FIRST_NAME: z.string().default('Store'),
  SEED_ADMIN_LAST_NAME: z.string().default('Admin'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: num(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('Verdance <no-reply@verdance.test>'),

  PAYMENT_PROVIDER: z.string().default('mock'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '\n❌ Invalid environment configuration:\n' +
      parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n') +
      '\n',
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

/** Origins allowed by CORS (comma-separated in CORS_ORIGIN). */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
