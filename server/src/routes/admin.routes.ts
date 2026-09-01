import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { adminOrderController } from '../controllers/order.controller';
import { adminReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/authenticate';
import { adminOnly } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  idParamSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from '../validators/order.validators';
import {
  couponCreateSchema,
  couponUpdateSchema,
  idParamSchema as couponIdParam,
} from '../validators/coupon.validators';
import { idParamSchema as reviewIdParam } from '../validators/review.validators';

export const adminRoutes = Router();

adminRoutes.use(authenticate, adminOnly);

// Dashboard & analytics
adminRoutes.get('/dashboard', adminController.dashboard);
adminRoutes.get('/analytics', adminController.analytics);

// Orders
adminRoutes.get('/orders', adminOrderController.list);
adminRoutes.get('/orders/:id', validate({ params: idParamSchema }), adminOrderController.detail);
adminRoutes.patch(
  '/orders/:id/status',
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  adminOrderController.updateStatus,
);
adminRoutes.patch(
  '/orders/:id/payment-status',
  validate({ params: idParamSchema, body: updatePaymentStatusSchema }),
  adminOrderController.updatePaymentStatus,
);

// Customers
adminRoutes.get('/customers', adminController.listCustomers);
adminRoutes.get('/customers/:id', validate({ params: idParamSchema }), adminController.getCustomer);
adminRoutes.patch(
  '/customers/:id/status',
  validate({ params: idParamSchema }),
  adminController.setCustomerStatus,
);

// Reviews moderation
adminRoutes.get('/reviews', adminReviewController.list);
adminRoutes.patch('/reviews/:id/approve', validate({ params: reviewIdParam }), adminReviewController.approve);
adminRoutes.patch('/reviews/:id/reject', validate({ params: reviewIdParam }), adminReviewController.reject);
adminRoutes.delete('/reviews/:id', validate({ params: reviewIdParam }), adminReviewController.remove);

// Coupons
adminRoutes.get('/coupons', adminController.listCoupons);
adminRoutes.post('/coupons', validate({ body: couponCreateSchema }), adminController.createCoupon);
adminRoutes.put(
  '/coupons/:id',
  validate({ params: couponIdParam, body: couponUpdateSchema }),
  adminController.updateCoupon,
);
adminRoutes.delete('/coupons/:id', validate({ params: couponIdParam }), adminController.removeCoupon);

// Newsletter
adminRoutes.get('/newsletter', adminController.listNewsletter);
