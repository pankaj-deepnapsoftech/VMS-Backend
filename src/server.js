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
import helmet from 'helmet';
import hpp from 'hpp';
import { DailyJob, DataJob } from './job/data.job.js';
import { handleNodeEnv } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();


// jobs run here
DataJob();
DailyJob();



app.use(json({ limit: '20mb' }));
app.use(urlencoded({ limit: '20mb', extended: true }));
app.use(hpp());
app.use(helmet({crossOriginResourcePolicy: { policy: 'cross-origin' },}));
app.use(
  cors({
    origin:handleNodeEnv(config.NODE_ENV).client,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE', 'GET', 'OPTIONS'],
    credentials: true,
  }),
);


app.set('trust proxy', 1);
app.get('/health', Health);
app.use('/api/v1', MainRoutes);
app.use('/file', express.static(path.join(__dirname, '../', 'public/temp')));
app.all('*', (req, _res, next) => {
  const path = req.originalUrl;
  next(new NotFoundError(`Path Not Found: ${path}`, 'server.js'));
});
app.use("*",(_req, res, next) => {
  res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
  next();
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
