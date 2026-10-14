import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './quantityDiscounts.controller.js';

// Rutas que cuelgan de /products/:productId/discounts
export const productDiscountsRouter: Router = Router({ mergeParams: true });
productDiscountsRouter.get('/', asyncHandler(controller.listDiscounts));
productDiscountsRouter.post(
	'/',
	requireAdmin,
	asyncHandler(controller.createDiscount),
	);

// Rutas planas que cuelgan de /discounts
export const discountsRouter: Router = Router();
discountsRouter.patch(
	'/:id',
	requireAdmin,
	asyncHandler(controller.updateDiscount),
	);
discountsRouter.delete(
	'/:id',
	requireAdmin,
	asyncHandler(controller.deleteDiscount),
	);