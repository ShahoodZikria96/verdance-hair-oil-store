import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const newsletterListQuerySchema = z.object({
  subscribed: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
