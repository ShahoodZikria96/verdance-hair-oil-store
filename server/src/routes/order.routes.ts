import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createOrderSchema, idParamSchema } from '../validators/order.validators';
import { z } from 'zod';

export const orderRoutes = Router();

// ── Public / guest-friendly ────────────────────────────────────────────
orderRoutes.get('/payment-options', orderController.paymentOptions);
orderRoutes.get('/lookup', orderController.guestLookup);
// Order creation works for guests (no token) and logged-in users (token → server cart).
orderRoutes.post(
  '/',
  optionalAuthenticate,
  validate({ body: createOrderSchema }),
  orderController.create,
);

// ── Authenticated only ─────────────────────────────────────────────────
orderRoutes.use(authenticate);
orderRoutes.get('/', orderController.list);
orderRoutes.get(
  '/by-number/:orderNumber',
  validate({ params: z.object({ orderNumber: z.string().trim().min(1) }) }),
  orderController.detailByNumber,
);
orderRoutes.get('/:id', validate({ params: idParamSchema }), orderController.detail);
orderRoutes.post('/:id/cancel', validate({ params: idParamSchema }), orderController.cancel);
