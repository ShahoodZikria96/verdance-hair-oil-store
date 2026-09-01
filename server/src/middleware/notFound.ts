import type { Request, Response } from 'express';
import { sendError } from '../utils/httpResponse';

export function notFound(req: Request, res: Response) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
