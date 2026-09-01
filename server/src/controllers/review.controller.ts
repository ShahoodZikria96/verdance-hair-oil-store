import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { reviewService } from '../services/review.service';
import { adminReviewQuerySchema, reviewListQuerySchema } from '../validators/review.validators';

export const reviewController = {
  listForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = reviewListQuerySchema.parse(req.query);
    const { reviews, meta } = await reviewService.listForProduct(req.params.slug, page, limit);
    sendSuccess(res, reviews, 'Reviews retrieved', 200, meta);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.user!.id, req.params.slug, req.body);
    sendSuccess(res, review, 'Review submitted — it will appear once approved', 201);
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await reviewService.listForUser(req.user!.id), 'Your reviews');
  }),
};

export const adminReviewController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = adminReviewQuerySchema.parse(req.query);
    const { reviews, meta } = await reviewService.adminList(query);
    sendSuccess(res, reviews, 'Reviews retrieved', 200, meta);
  }),
  approve: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await reviewService.setApproval(req.params.id, true), 'Review approved');
  }),
  reject: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await reviewService.setApproval(req.params.id, false), 'Review unpublished');
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await reviewService.remove(req.params.id), 'Review deleted');
  }),
};
