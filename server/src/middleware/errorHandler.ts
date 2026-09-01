import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/httpResponse';
import { logger } from '../lib/logger';
import { isProd } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        message = `A record with this ${target} already exists`;
        break;
      }
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 409;
        message = 'Operation violates a data relationship constraint';
        break;
      default:
        statusCode = 400;
        message = 'Database request error';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid database query';
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  const logPayload = {
    err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  };
  if (statusCode >= 500) logger.error(logPayload, 'Unhandled error');
  else logger.warn(logPayload, 'Request error');

  // Never leak internals in production.
  if (statusCode >= 500 && isProd) {
    message = 'Internal server error';
    errors = [];
  }

  sendError(res, message, statusCode, errors);
}
