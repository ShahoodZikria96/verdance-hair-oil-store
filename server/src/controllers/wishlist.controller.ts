import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { wishlistService } from '../services/wishlist.service';

export const wishlistController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await wishlistService.list(req.user!.id), 'Wishlist retrieved');
  }),
  add: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await wishlistService.add(req.user!.id, req.params.productId), 'Added to wishlist', 201);
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await wishlistService.remove(req.user!.id, req.params.productId), 'Removed from wishlist');
  }),
};
