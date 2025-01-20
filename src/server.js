import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { config } from './config/env.config.js';

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

export { app };
