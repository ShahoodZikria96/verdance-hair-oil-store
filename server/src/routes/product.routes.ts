import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/authorize';
import {
  createProductSchema,
  idParamSchema,
  slugParamSchema,
  updateProductSchema,
  updateStockSchema,
} from '../validators/product.validators';

export const productRoutes = Router();

// Public (auth optional so admins can preview inactive products)
productRoutes.get('/', optionalAuthenticate, productController.list);
productRoutes.get('/best-seller', productController.bestSeller);
productRoutes.get('/featured', productController.featured);
productRoutes.get(
  '/:slug/related',
  validate({ params: slugParamSchema }),
  productController.related,
);
productRoutes.get(
  '/:slug',
  optionalAuthenticate,
  validate({ params: slugParamSchema }),
  productController.detail,
);

// Admin
productRoutes.post(
  '/',
  authenticate,
  adminOnly,
  validate({ body: createProductSchema }),
  productController.create,
);
productRoutes.put(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema, body: updateProductSchema }),
  productController.update,
);
productRoutes.patch(
  '/:id/stock',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema, body: updateStockSchema }),
  productController.updateStock,
);
productRoutes.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema }),
  productController.remove,
);
