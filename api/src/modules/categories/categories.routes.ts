import { Router } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { optionalAdmin, requireAdmin } from '../../middlewares/auth.js';
import * as controller from './categories.controller.js';

export const categoriesRouter: Router = Router();

// --- Públicas ---
categoriesRouter.get('/', optionalAdmin, asyncHandler(controller.listCategories));
categoriesRouter.get('/:slug/subcategories', asyncHandler(controller.listSubcategories), );
categoriesRouter.get('/:slug', asyncHandler(controller.getCategoryBySlug));

// --- Admin ---
categoriesRouter.post('/', requireAdmin, asyncHandler(controller.createCategory), );
categoriesRouter.patch('/:id', requireAdmin, asyncHandler(controller.updateCategory), );
categoriesRouter.delete('/:id', requireAdmin, asyncHandler(controller.deleteCategory), );