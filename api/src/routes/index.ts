import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { cartRouter } from '../modules/cart/cart.routes.js';
import { categoriesRouter } from '../modules/categories/categories.routes.js';
import { couponsRouter } from '../modules/coupons/coupons.routes.js';
import { emailsRouter } from '../modules/emails/emails.routes.js';
import {
  adminOrdersRouter,
  ordersRouter,
} from '../modules/orders/orders.routes.js';
import { paymentsRouter } from '../modules/payments/payments.routes.js';
import { productsRouter } from '../modules/products/products.routes.js';
import { presentationsRouter } from '../modules/presentations/presentations.routes.js';
import { imagesRouter } from '../modules/productImages/productImages.routes.js';
import { discountsRouter } from '../modules/quantityDiscounts/quantityDiscounts.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';
import { shippingRouter } from '../modules/shipping/shipping.routes.js';
import { uploadsRouter } from '../modules/uploads/uploads.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';

export const router: Router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
router.use('/cart', cartRouter);
router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/presentations', presentationsRouter);
router.use('/images', imagesRouter);
router.use('/discounts', discountsRouter);
router.use('/coupons', couponsRouter);
router.use('/shipping', shippingRouter);
router.use('/orders', ordersRouter);
router.use('/admin/orders', adminOrdersRouter);
router.use('/admin', adminRouter);
router.use('/payments', paymentsRouter);
router.use('/emails', emailsRouter);
router.use('/uploads', uploadsRouter);
router.use('/admin/settings', settingsRouter);