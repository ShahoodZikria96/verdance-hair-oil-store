import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiters';
import { subscribeSchema } from '../validators/newsletter.validators';

export const newsletterRoutes = Router();

newsletterRoutes.post(
  '/subscribe',
  writeLimiter,
  validate({ body: subscribeSchema }),
  newsletterController.subscribe,
);
newsletterRoutes.post(
  '/unsubscribe',
  writeLimiter,
  validate({ body: subscribeSchema }),
  newsletterController.unsubscribe,
);
