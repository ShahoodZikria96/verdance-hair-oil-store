import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { couponService } from '../services/coupon.service';

export const couponController = {
  /** Public: validate a code and preview the discount for a subtotal. */
  preview: asyncHandler(async (req: Request, res: Response) => {
    const subtotal = Number(req.body.subtotal ?? 0);
    const result = await couponService.preview(req.body.code, subtotal);
    sendSuccess(res, result, 'Coupon is valid');
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await couponService.list(), 'Coupons retrieved');
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.create(req.body), 'Coupon created', 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.update(req.params.id, req.body), 'Coupon updated');
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.remove(req.params.id), 'Coupon deactivated');
  }),
};
