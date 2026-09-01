import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { newsletterService } from '../services/newsletter.service';
import { newsletterListQuerySchema } from '../validators/newsletter.validators';

export const newsletterController = {
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.subscribe(req.body.email);
    sendSuccess(res, result, 'You are subscribed — welcome to the ritual', 201);
  }),
  unsubscribe: asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.unsubscribe(req.body.email);
    sendSuccess(res, result, 'You have been unsubscribed');
  }),
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = newsletterListQuerySchema.parse(req.query);
    const { subscribers, meta } = await newsletterService.list(query);
    sendSuccess(res, subscribers, 'Subscribers retrieved', 200, meta);
  }),
};
