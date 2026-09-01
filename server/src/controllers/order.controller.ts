import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import { orderService } from '../services/order.service';
import { guestLookupSchema, orderListQuerySchema } from '../validators/order.validators';
import { codFee, codMaxOrder, isCodEnabled } from '../services/payment/PaymentService';
import { env } from '../config/env';

export const orderController = {
  paymentOptions: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        currency: env.STORE_CURRENCY,
        methods: [
          {
            code: 'COD',
            label: 'Cash on Delivery',
            description: 'Pay in cash when your order is delivered.',
            enabled: isCodEnabled(),
            fee: codFee(),
            maxOrderAmount: codMaxOrder(),
          },
          {
            code: 'CARD',
            label: 'Card payment',
            description: 'Simulated card payment — no card details are collected in this demo.',
            enabled: true,
            fee: 0,
            maxOrderAmount: null,
          },
        ],
      },
      'Payment options',
    );
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    // Guest checkout allowed — req.user is populated only when a token was sent.
    const order = await orderService.create(req.user?.id ?? null, req.body);
    sendSuccess(res, order, 'Order placed', 201);
  }),

  guestLookup: asyncHandler(async (req: Request, res: Response) => {
    const { orderNumber, email } = guestLookupSchema.parse(req.query);
    sendSuccess(res, await orderService.guestLookup(orderNumber, email), 'Order retrieved');
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = orderListQuerySchema.parse(req.query);
    const { orders, meta } = await orderService.listForUser(req.user!.id, query);
    sendSuccess(res, orders, 'Orders retrieved', 200, meta);
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await orderService.getForUser(req.user!.id, req.params.id), 'Order retrieved');
  }),

  detailByNumber: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await orderService.getByNumberForUser(req.user!.id, req.params.orderNumber),
      'Order retrieved',
    );
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await orderService.cancelForUser(req.user!.id, req.params.id), 'Order cancelled');
  }),
};

export const adminOrderController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = orderListQuerySchema.parse(req.query);
    const { orders, meta } = await orderService.adminList(query);
    sendSuccess(res, orders, 'Orders retrieved', 200, meta);
  }),
  detail: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await orderService.adminGet(req.params.id), 'Order retrieved');
  }),
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await orderService.adminUpdateStatus(req.params.id, req.body.status),
      'Order status updated',
    );
  }),
  updatePaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(
      res,
      await orderService.adminUpdatePaymentStatus(req.params.id, req.body.paymentStatus),
      'Payment status updated',
    );
  }),
};
