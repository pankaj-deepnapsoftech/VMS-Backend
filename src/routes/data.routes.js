import { Router } from 'express';
// local imports
import {
  CreateData,
  getApplicationData,
  DeteleOneData,
  updateOneData,
  AddNewData,
  DeleteManyData,
  getInfrastructureData,
  getAllVulnerabilityData,
  GetTVMCardData,
} from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(Authentication, upload.single('excel'), CreateData);
routes.route('/add-new').post(Authentication, AddNewData);
routes.route('/get-application').get(Authentication, getApplicationData);
routes.route('/get-infrastructure').get(Authentication, getInfrastructureData);
routes.route('/delete/:id').delete(Authentication, DeteleOneData);
routes.route("/delete-many").post(Authentication,DeleteManyData);
routes.route('/update/:id').patch(Authentication, updateOneData);
routes.route("/risk-quantification").get(Authentication,getAllVulnerabilityData);
routes.route("/tvm-cards").get(Authentication,GetTVMCardData);

export default routes;
