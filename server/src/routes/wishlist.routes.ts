import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { z } from 'zod';

export const wishlistRoutes = Router();
const productParam = z.object({ productId: z.string().trim().min(1) });

wishlistRoutes.use(authenticate);
wishlistRoutes.get('/', wishlistController.list);
wishlistRoutes.post('/:productId', validate({ params: productParam }), wishlistController.add);
wishlistRoutes.delete('/:productId', validate({ params: productParam }), wishlistController.remove);
