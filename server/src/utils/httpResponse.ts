import type { Response } from 'express';

interface Meta {
  [key: string]: unknown;
}

/** Consistent success envelope. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200,
  meta?: Meta,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

/** Consistent error envelope (used by the error handler). */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors: unknown[] = [],
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
