import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { apiRouter } from './routes';

export const app = express();

app.use(requestIdMiddleware);
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
