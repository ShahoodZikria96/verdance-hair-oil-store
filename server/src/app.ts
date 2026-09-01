import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { corsOrigins, isDev } from './config/env';

/**
 * True when `origin` is allowed:
 *  - it's in the explicit CORS_ORIGIN / FRONTEND_URL allow-list, OR
 *  - the allow-list contains a *.vercel.app entry AND `origin` is any
 *    *.vercel.app URL (covers Vercel's ever-changing preview / per-deploy URLs).
 */
function isOriginAllowed(origin: string): boolean {
  if (corsOrigins.includes(origin)) return true;
  const usesVercel = corsOrigins.some((o) => /\.vercel\.app$/i.test(o));
  if (usesVercel && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}
import { logger } from './lib/logger';
import { apiRouter } from './routes';
import { openapiDocument } from './docs/openapi';
import { apiLimiter } from './middleware/rateLimiters';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || isOriginAllowed(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
    }),
  );

  // API docs
  app.get('/api/docs.json', (_req, res) => res.json(openapiDocument));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { customSiteTitle: 'Verdance API' }));

  // Rate-limited API
  app.use('/api', apiLimiter, apiRouter);

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Verdance API',
      data: { docs: '/api/docs', health: '/api/health', env: isDev ? 'development' : 'production' },
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
