import { Router } from 'express';
// local imports
import AuthRoutes from './Auth.routes.js';
import DataRoutes from "./data.routes.js";

const routes = Router();

routes.use('/auth', AuthRoutes);
routes.use('/data', DataRoutes);

export default routes;
