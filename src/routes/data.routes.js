import { Router } from 'express';
// local imports
import { CreateData } from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

routes.route('/create').post(upload.single("excel"), CreateData);

export default routes;
