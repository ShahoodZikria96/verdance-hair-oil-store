/**
 * Generates prisma/schema.dev.prisma (SQLite) from prisma/schema.prisma (MySQL).
 *
 * Why: MySQL is the production database (see schema.prisma + docker-compose.yml),
 * but local dev should run with zero infrastructure. SQLite needs no server.
 * The two schemas differ ONLY in the datasource block + a few provider-specific
 * attributes, so this keeps them in perfect sync automatically.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'prisma', 'schema.prisma');
const out = join(here, '..', 'prisma', 'schema.dev.prisma');

let schema = readFileSync(src, 'utf8');

// 1. datasource → sqlite
schema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`,
);

// 1b. drop production-only binaryTargets (local dev just needs "native")
schema = schema.replace(/\n\s*binaryTargets\s*=\s*\[[^\]]*\]/, '');

// 2. drop enum blocks (SQLite has no native enums)
schema = schema.replace(/\nenum \w+ \{[\s\S]*?\n\}\n/g, '\n');

// 3. enum field types → String, and quote their defaults
schema = schema
  .replace(/\b(Role|DiscountType|OrderStatus|PaymentStatus|PaymentMethod)\b(\??)(\s+)/g, 'String$2$3')
  .replace(/@default\((CUSTOMER|ADMIN|PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED|PAID|FAILED|REFUNDED|PERCENTAGE|FIXED|COD|CARD)\)/g, '@default("$1")');

// 4. strip MySQL-only native type attributes
schema = schema.replace(/ @db\.Text/g, '').replace(/ @db\.Decimal\(\d+,\s*\d+\)/g, '');

// 5. header note
schema = `// AUTO-GENERATED from schema.prisma by scripts/gen-dev-schema.mjs — do not edit.\n// Local-dev only (SQLite, no server). Production uses schema.prisma (MySQL).\n\n${schema.replace(/^\/\/[^\n]*\n\/\/[^\n]*\n\n/, '')}`;

writeFileSync(out, schema);
console.log('✓ wrote prisma/schema.dev.prisma (SQLite dev schema)');
