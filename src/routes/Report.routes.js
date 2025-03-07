import { Router } from 'express';
import { AssessorReport, CreateReport, DeleteReport, GetReport, OrganizationReport, UpdateReport } from '../controller/Report.Controller.js';
import { AdminAuthentication,  ClientCISOAuthentication, EmployeeAuthentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

routes.route('/detailed-report').post(EmployeeAuthentication, upload.single('report'), CreateReport);
routes.route('/get-report').get(AdminAuthentication, GetReport);
routes.route('/delete-report/:id').delete(EmployeeAuthentication, DeleteReport);
routes.route('/update-report/:id').put(EmployeeAuthentication, upload.single('report'), UpdateReport);
routes.route('/get-report-org').get(ClientCISOAuthentication, OrganizationReport);
routes.route('/get-report-assesor').get(EmployeeAuthentication, AssessorReport);




export default routes;
