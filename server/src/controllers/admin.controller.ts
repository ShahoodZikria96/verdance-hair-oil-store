import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { dashboardService } from '../services/dashboard.service';
import { userService } from '../services/user.service';
import { newsletterService } from '../services/newsletter.service';
import { couponService } from '../services/coupon.service';
import { newsletterListQuerySchema } from '../validators/newsletter.validators';

const customerListQuery = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await dashboardService.overview(), 'Dashboard statistics');
  }),
  analytics: asyncHandler(async (req: Request, res: Response) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 365);
    sendSuccess(res, await dashboardService.analytics(days), 'Analytics');
  }),

  listCustomers: asyncHandler(async (req: Request, res: Response) => {
    const query = customerListQuery.parse(req.query);
    const { customers, meta } = await userService.list(query);
    sendSuccess(res, customers, 'Customers retrieved', 200, meta);
  }),
  getCustomer: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await userService.get(req.params.id), 'Customer retrieved');
  }),
  setCustomerStatus: asyncHandler(async (req: Request, res: Response) => {
    const isActive = Boolean(req.body.isActive);
    sendSuccess(res, await userService.setActive(req.params.id, isActive), 'Customer status updated');
  }),

  listNewsletter: asyncHandler(async (req: Request, res: Response) => {
    const query = newsletterListQuerySchema.parse(req.query);
    const { subscribers, meta } = await newsletterService.list(query);
    sendSuccess(res, subscribers, 'Subscribers retrieved', 200, meta);
  }),

  listCoupons: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await couponService.list(), 'Coupons retrieved');
  }),
  createCoupon: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.create(req.body), 'Coupon created', 201);
  }),
  updateCoupon: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.update(req.params.id, req.body), 'Coupon updated');
  }),
  removeCoupon: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await couponService.remove(req.params.id), 'Coupon deactivated');
  }),
};
