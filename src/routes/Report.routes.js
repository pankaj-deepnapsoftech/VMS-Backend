import { Router } from 'express';
import { AssessorReport, CreateReport, DeleteReport, GetReport, OrganizationReport, UpdateReport } from '../controller/Report.Controller.js';
import {  Authentication,EmployeeAuthentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

routes.route('/detailed-report').post(Authentication, CreateReport);
routes.route('/get-report').get(Authentication, GetReport);
routes.route('/delete-report/:id').delete(EmployeeAuthentication, DeleteReport);
routes.route('/update-report/:id').put(EmployeeAuthentication, upload.single('report'), UpdateReport);
routes.route('/get-report-org').get(Authentication, OrganizationReport);
routes.route('/get-report-assesor').get(EmployeeAuthentication, AssessorReport);

export default routes;
