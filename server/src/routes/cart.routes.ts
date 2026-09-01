import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  addItemSchema,
  itemParamSchema,
  mergeCartSchema,
  updateItemSchema,
} from '../validators/cart.validators';

export const cartRoutes = Router();

cartRoutes.use(authenticate);

cartRoutes.get('/', cartController.get);
cartRoutes.post('/items', validate({ body: addItemSchema }), cartController.addItem);
cartRoutes.put(
  '/items/:itemId',
  validate({ params: itemParamSchema, body: updateItemSchema }),
  cartController.updateItem,
);
cartRoutes.delete('/items/:itemId', validate({ params: itemParamSchema }), cartController.removeItem);
cartRoutes.delete('/', cartController.clear);
cartRoutes.post('/merge', validate({ body: mergeCartSchema }), cartController.merge);
