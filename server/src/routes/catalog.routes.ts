import { Router } from 'express';
import { categoryController, ingredientController } from '../controllers/catalog.controller';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/authorize';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  idParamSchema,
  ingredientCreateSchema,
  ingredientUpdateSchema,
  slugParamSchema,
} from '../validators/catalog.validators';

export const categoryRoutes = Router();
categoryRoutes.get('/', optionalAuthenticate, categoryController.list);
categoryRoutes.get('/:slug', validate({ params: slugParamSchema }), categoryController.detail);
categoryRoutes.post(
  '/',
  authenticate,
  adminOnly,
  validate({ body: categoryCreateSchema }),
  categoryController.create,
);
categoryRoutes.put(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  categoryController.update,
);
categoryRoutes.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema }),
  categoryController.remove,
);

export const ingredientRoutes = Router();
ingredientRoutes.get('/', ingredientController.list);
ingredientRoutes.get('/:slug', validate({ params: slugParamSchema }), ingredientController.detail);
ingredientRoutes.post(
  '/',
  authenticate,
  adminOnly,
  validate({ body: ingredientCreateSchema }),
  ingredientController.create,
);
ingredientRoutes.put(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema, body: ingredientUpdateSchema }),
  ingredientController.update,
);
ingredientRoutes.delete(
  '/:id',
  authenticate,
  adminOnly,
  validate({ params: idParamSchema }),
  ingredientController.remove,
);
