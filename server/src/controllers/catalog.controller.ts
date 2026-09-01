import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { categoryService } from '../services/category.service';
import { ingredientService } from '../services/ingredient.service';

export const categoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.user?.role === 'ADMIN' && req.query.all === 'true';
    sendSuccess(res, await categoryService.list(includeInactive), 'Categories retrieved');
  }),
  detail: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await categoryService.getBySlug(req.params.slug), 'Category retrieved');
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await categoryService.create(req.body), 'Category created', 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await categoryService.update(req.params.id, req.body), 'Category updated');
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await categoryService.remove(req.params.id), 'Category removed');
  }),
};

export const ingredientController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await ingredientService.list(), 'Ingredients retrieved');
  }),
  detail: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ingredientService.getBySlug(req.params.slug), 'Ingredient retrieved');
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ingredientService.create(req.body), 'Ingredient created', 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ingredientService.update(req.params.id, req.body), 'Ingredient updated');
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await ingredientService.remove(req.params.id), 'Ingredient removed');
  }),
};
