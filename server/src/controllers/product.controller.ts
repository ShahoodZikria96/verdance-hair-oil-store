import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { productService } from '../services/product.service';
import { productListQuerySchema } from '../validators/product.validators';

const publicOpts = { publicOnly: true } as const;

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = productListQuerySchema.parse(req.query);
    const isAdmin = req.user?.role === 'ADMIN';
    const { products, meta } = await productService.list(query, {
      publicOnly: !isAdmin || req.query.scope !== 'admin',
    });
    sendSuccess(res, products, 'Products retrieved', 200, meta);
  }),

  bestSeller: asyncHandler(async (_req: Request, res: Response) => {
    const product = await productService.getBestSeller(publicOpts);
    sendSuccess(res, product, 'Best seller retrieved');
  }),

  featured: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 8, 24);
    const products = await productService.getFeatured(limit, publicOpts);
    sendSuccess(res, products, 'Featured products retrieved');
  }),

  related: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 4, 12);
    const products = await productService.getRelated(req.params.slug, limit);
    sendSuccess(res, products, 'Related products retrieved');
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === 'ADMIN';
    const product = await productService.getBySlug(req.params.slug, { publicOnly: !isAdmin });
    sendSuccess(res, product, 'Product retrieved');
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    sendSuccess(res, product, 'Product created', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    sendSuccess(res, product, 'Product updated');
  }),

  updateStock: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.setStock(req.params.id, req.body.stockQuantity);
    sendSuccess(res, result, 'Stock updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.remove(req.params.id);
    sendSuccess(res, result, 'Product removed');
  }),
};
