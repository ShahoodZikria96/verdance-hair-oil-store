import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { cartService } from '../services/cart.service';

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.get(req.user!.id), 'Cart retrieved');
  }),
  addItem: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    sendSuccess(res, await cartService.addItem(req.user!.id, productId, quantity), 'Item added', 201);
  }),
  updateItem: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await cartService.updateItem(req.user!.id, req.params.itemId, req.body.quantity),
      'Item updated',
    );
  }),
  removeItem: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.removeItem(req.user!.id, req.params.itemId), 'Item removed');
  }),
  clear: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.clear(req.user!.id), 'Cart cleared');
  }),
  merge: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.merge(req.user!.id, req.body.items), 'Cart merged');
  }),
};
