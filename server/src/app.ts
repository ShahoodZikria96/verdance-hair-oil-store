import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { corsOrigins, isDev } from './config/env';
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
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
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
