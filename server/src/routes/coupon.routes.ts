import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiters';
import { validateCouponSchema } from '../validators/coupon.validators';

/** Public coupon endpoints (mounted at /api/coupons). */
export const couponRoutes = Router();

couponRoutes.post(
  '/validate',
  writeLimiter,
  validate({ body: validateCouponSchema }),
  couponController.preview,
);
