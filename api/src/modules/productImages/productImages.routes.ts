import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { requireAdmin } from '../../middlewares/auth.js';
import * as controller from './productImages.controller.js';

// Rutas que cuelgan de /products/:productId/images
export const productImagesRouter: Router = Router({ mergeParams: true });
productImagesRouter.get('/', asyncHandler(controller.listImages));
productImagesRouter.post('/', requireAdmin, asyncHandler(controller.createImage), );

// Rutas planas que cuelgan de /images
export const imagesRouter: Router = Router();
imagesRouter.patch('/:id', requireAdmin, asyncHandler(controller.updateImage));
imagesRouter.delete('/:id', requireAdmin, asyncHandler(controller.deleteImage));