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
  TVMFirstChart,
  TVMSecondChart,
  TVMNinthChart,
  getAllVulnerabilityDataForUser,
  TVMThirdChart,
  TVMthenthChart,
  TVMElaventhChart,
  TVMTwalththChart,
  TVMThirteenthChart,
  TVMfourteenthChart,
  TVMfifthteenthChart,
  TVMSixteenthChart,
  TVMninteenthChart,
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
routes.route("/tvm-first-chart").get(Authentication,TVMFirstChart);
routes.route("/tvm-second-chart").get(Authentication,TVMSecondChart);
routes.route("/tvm-nine-chart").get(Authentication,TVMNinthChart);
routes.route("/get-assign-data").get(Authentication,getAllVulnerabilityDataForUser);
routes.route("/tvm-third-data").get(Authentication,TVMThirdChart);
routes.route("/tvm-thenth-data").get(Authentication,TVMthenthChart);
routes.route("/tvm-elaventh-data").get(Authentication,TVMElaventhChart);
routes.route("/tvm-twelfth-data").get(Authentication,TVMTwalththChart);
routes.route("/tvm-tharteenth-data").get(Authentication,TVMThirteenthChart);
routes.route("/tvm-fourteenth-data").get(Authentication,TVMfourteenthChart);
routes.route("/tvm-fifteen-data").get(Authentication,  TVMfifthteenthChart);
routes.route("/tvm-sixteen-data").get(Authentication,  TVMSixteenthChart);
routes.route("/tvm-ninteen-data").get(Authentication,  TVMninteenthChart);

export default routes;
