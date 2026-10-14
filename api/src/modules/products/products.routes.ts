import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { optionalAdmin, requireAdmin } from '../../middlewares/auth.js';
import { productImagesRouter } from '../productImages/productImages.routes.js';
import { productPresentationsRouter } from '../presentations/presentations.routes.js';
import { productDiscountsRouter } from '../quantityDiscounts/quantityDiscounts.routes.js';
import * as controller from './products.controller.js';

export const productsRouter: Router = Router();

// --- Subrecursos ---
productsRouter.use('/:productId/presentations', productPresentationsRouter);
productsRouter.use('/:productId/images', productImagesRouter);
productsRouter.use('/:productId/discounts', productDiscountsRouter);

// --- Públicas ---
productsRouter.get('/', optionalAdmin, asyncHandler(controller.listProducts));
productsRouter.get(
  '/:slug',
  optionalAdmin,
  asyncHandler(controller.getProductBySlug),
);

// --- Admin ---
productsRouter.post('/', requireAdmin, asyncHandler(controller.createProduct));
productsRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(controller.updateProduct),
);
productsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(controller.deleteProduct),
);