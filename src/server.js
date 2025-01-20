import express, { json, urlencoded } from 'express';
import cors from 'cors';
// local imports
import { config } from './config/env.config.js';
import { Health } from './controller/health.controller.js';
import MainRoutes from './routes/index.js';
import { CustomError, NotFoundError } from './utils/customError.js';

const app = express();

app.use(json({ limit: '20mb' }));
app.use(urlencoded({ limit: '20mb', extended: true }));
app.use(
  cors({
    origin: config.CLIENT_URL,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET', 'OPTIONS'],
    credentials: true,
  }),
);

app.get('/health', Health);
app.use('/api/v1', MainRoutes);
app.all('*', (_req, _res, next) => {
  next(new NotFoundError('Path Not Found ', 'server.js '));
});

app.use((error, _req, res, next) => {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json(error.serializeErrors());
  }
  next();
});

export { app };
