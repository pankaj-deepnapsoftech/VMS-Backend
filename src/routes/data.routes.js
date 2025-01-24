import { Router } from 'express';
// local imports
import {
  CreateData,
  getAllData,
  DeteleOneData,
  updateOneData,
  DataCounsts,
  vulnerableItems,
} from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes
  .route('/create')
  .post(Authentication, upload.single('excel'), CreateData);
routes.route('/get').get(Authentication, getAllData);
routes.route('/delete/:id').delete(Authentication, DeteleOneData);
routes.route('/update/:id').get(Authentication, updateOneData);
routes.route("/total-data-count").get(Authentication,DataCounsts)
routes.route("/vulnerableItems").get(Authentication,vulnerableItems)

export default routes;
