import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { fileURLToPath } from 'url';
// local imports
import { config } from './config/env.config.js';
import { Health } from './controller/health.controller.js';
import MainRoutes from './routes/index.js';
import { CustomError, NotFoundError } from './utils/customError.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(json({ limit: '20mb' }));
app.use(urlencoded({ limit: '20mb', extended: true }));
app.use(
  cors({
    origin: config.NODE_ENV !== 'development' ? config.CLIENT_URL : config.CLIENT_URL_LOCAL,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET', 'OPTIONS'],
    credentials: true,
  }),
);

app.get('/health', Health);
app.use('/api/v1', MainRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/file', express.static(path.join(__dirname, '../', 'public/temp')));
app.all('*', (_req, _res, next) => {
  next(new NotFoundError('Path Not Found ', 'server.js '));
});

app.use((error, _req, res, next) => {
  if (error.name === 'JsonWebTokenError') {
    res.status(StatusCodes.BAD_GATEWAY).json({ message: 'Invalid Token', status: 'error' });
  } else if (error.name === 'TokenExpiredError') {
    res.status(StatusCodes.BAD_GATEWAY).json({ message: 'Token Expired', status: 'error' });
  } else if (error instanceof CustomError) {
    res.status(error.statusCode).json(error.serializeErrors());
  } else {
    res.status(StatusCodes.BAD_GATEWAY).json({
      message: error.message || 'somthing went Wrong',
      status: 'error',
      error: error.name,
    });
  }
  next();
});

export { app };
