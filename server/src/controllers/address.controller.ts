import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { addressService } from '../services/address.service';

export const addressController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.list(req.user!.id), 'Addresses retrieved');
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.create(req.user!.id, req.body), 'Address created', 201);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.update(req.user!.id, req.params.id, req.body), 'Address updated');
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.remove(req.user!.id, req.params.id), 'Address removed');
  }),
  setDefault: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await addressService.setDefault(req.user!.id, req.params.id), 'Default address set');
  }),
};
