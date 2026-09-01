import { Prisma } from '@prisma/client';

export type Decimal = Prisma.Decimal;
export const D = Prisma.Decimal;

/** Round to 2 dp as a Decimal. */
export const money = (value: Prisma.Decimal.Value): Decimal =>
  new D(value).toDecimalPlaces(2, D.ROUND_HALF_UP);

/** Decimal -> number for JSON responses. */
export const toNumber = (value: Decimal | null | undefined): number | null =>
  value == null ? null : Number(value);

export const add = (...values: Prisma.Decimal.Value[]): Decimal =>
  money(values.reduce<Decimal>((sum, v) => sum.add(new D(v)), new D(0)));

export const mul = (a: Prisma.Decimal.Value, b: Prisma.Decimal.Value): Decimal =>
  money(new D(a).mul(new D(b)));
