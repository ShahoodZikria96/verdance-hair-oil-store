import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  addressCreateSchema,
  addressUpdateSchema,
  idParamSchema,
} from '../validators/address.validators';

export const addressRoutes = Router();

addressRoutes.use(authenticate);
addressRoutes.get('/', addressController.list);
addressRoutes.post('/', validate({ body: addressCreateSchema }), addressController.create);
addressRoutes.put(
  '/:id',
  validate({ params: idParamSchema, body: addressUpdateSchema }),
  addressController.update,
);
addressRoutes.delete('/:id', validate({ params: idParamSchema }), addressController.remove);
addressRoutes.patch('/:id/default', validate({ params: idParamSchema }), addressController.setDefault);
