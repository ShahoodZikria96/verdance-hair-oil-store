import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { productRoutes } from './product.routes';
import { productReviewRoutes, reviewRoutes } from './review.routes';
import { categoryRoutes, ingredientRoutes } from './catalog.routes';
import { cartRoutes } from './cart.routes';
import { wishlistRoutes } from './wishlist.routes';
import { addressRoutes } from './address.routes';
import { orderRoutes } from './order.routes';
import { couponRoutes } from './coupon.routes';
import { newsletterRoutes } from './newsletter.routes';
import { adminRoutes } from './admin.routes';
import { currencyService } from '../services/currency.service';
import { sendSuccess } from '../utils/httpResponse';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, message: 'ok', data: { uptime: process.uptime() } });
});

apiRouter.get('/currencies', (_req, res) => {
  sendSuccess(res, currencyService.list(), 'Supported currencies');
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productReviewRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/ingredients', ingredientRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/newsletter', newsletterRoutes);
apiRouter.use('/admin', adminRoutes);
