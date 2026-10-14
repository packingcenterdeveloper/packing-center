import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './presentations.controller.js';

// Rutas que cuelgan de /products/:productId/presentations
export const productPresentationsRouter: Router = Router({
  mergeParams: true,
});
productPresentationsRouter.get('/', asyncHandler(controller.listPresentations));
productPresentationsRouter.post('/', requireAdmin, asyncHandler(controller.createPresentation), );

// Rutas planas que cuelgan de /presentations
export const presentationsRouter: Router = Router();
presentationsRouter.patch('/:id', requireAdmin, asyncHandler(controller.updatePresentation), );
presentationsRouter.delete( '/:id', requireAdmin, asyncHandler(controller.deletePresentation), );