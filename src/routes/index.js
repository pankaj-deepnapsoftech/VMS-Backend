import { Router } from 'express';
// local imports
import AuthRoutes from './Auth.routes.js';

const routes = Router();

routes.use('/auth', AuthRoutes);

export default routes;
