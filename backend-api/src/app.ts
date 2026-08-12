import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { apiRouter } from './routes';
import { ensureUploadDirectories } from './services/upload.service';

export const app = express();

void ensureUploadDirectories().catch((error: unknown) => {
  console.error('Failed to initialize upload directories', error);
});

app.use(requestIdMiddleware);
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', (req, res, next) => {
  const normalized = req.path.replace(/\\/g, '/');
  if (normalized === '/docs' || normalized.startsWith('/docs/')) {
    res.status(404).end();
    return;
  }

  next();
}, express.static(env.uploadRoot));

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
