import { z } from 'zod';

export const addressCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(6).max(20).regex(/^[+0-9()\-\s]+$/, 'Invalid phone number'),
  addressLine1: z.string().trim().min(3).max(160),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressCreateSchema.partial();

export const idParamSchema = z.object({ id: z.string().trim().min(1) });
