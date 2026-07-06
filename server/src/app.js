import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import fs from 'node:fs';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { sessionMiddleware } from './middlewares/session.middleware.js';
import apiRouter from './routes/index.js';
import { sendSuccess } from './utils/api-response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
const hasClientBuild = fs.existsSync(clientIndexPath);
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sessionMiddleware);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (!hasClientBuild) {
  app.get('/', (req, res) => {
    sendSuccess(res, {
      message: `${env.APP_NAME} is running`,
      data: {
        docs: `${env.API_PREFIX}/health`,
        environment: env.NODE_ENV,
      },
    });
  });
}

app.use(env.API_PREFIX, apiRouter);

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith(env.API_PREFIX)) {
      next();
      return;
    }

    res.sendFile(clientIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
