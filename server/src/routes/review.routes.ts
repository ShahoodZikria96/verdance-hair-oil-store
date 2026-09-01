import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiters';
import { createReviewSchema, slugParamSchema } from '../validators/review.validators';

/** Mounted at /api/products (product-scoped review endpoints). */
export const productReviewRoutes = Router();

productReviewRoutes.get(
  '/:slug/reviews',
  validate({ params: slugParamSchema }),
  reviewController.listForProduct,
);
productReviewRoutes.post(
  '/:slug/reviews',
  authenticate,
  authorize('CUSTOMER', 'ADMIN'),
  writeLimiter,
  validate({ params: slugParamSchema, body: createReviewSchema }),
  reviewController.create,
);

/** Mounted at /api/reviews. */
export const reviewRoutes = Router();
reviewRoutes.get('/me', authenticate, reviewController.listMine);
