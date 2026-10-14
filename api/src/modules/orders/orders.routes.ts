import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './orders.controller.js';

// Rutas públicas (cliente)
export const ordersRouter: Router = Router();

ordersRouter.post('/checkout', asyncHandler(controller.checkout));
ordersRouter.get(
	'/by-phone/:phone',
	asyncHandler(controller.getOrdersByPhone),
	);
ordersRouter.get('/:id', asyncHandler(controller.getOrderForCustomer));

// Rutas admin (montadas bajo /admin/orders)
export const adminOrdersRouter: Router = Router();

adminOrdersRouter.get(
	'/',
	requireAdmin,
	asyncHandler(controller.adminListOrders),
	);
adminOrdersRouter.get(
	'/dashboard',
	requireAdmin,
	asyncHandler(controller.adminDashboard),
	);
adminOrdersRouter.get(
	'/:id',
	requireAdmin,
	asyncHandler(controller.adminGetOrder),
	);
adminOrdersRouter.patch(
	'/:id/status',
	requireAdmin,
	asyncHandler(controller.adminUpdateStatus),
	);
adminOrdersRouter.patch(
	'/:id/mark-paid',
	requireAdmin,
	asyncHandler(controller.adminMarkPaid),
	);
adminOrdersRouter.patch(
	'/:id/cancel',
	requireAdmin,
	asyncHandler(controller.adminCancel),
	);
adminOrdersRouter.delete(
	'/:id',
	requireAdmin,
	asyncHandler(controller.adminDelete),
	);