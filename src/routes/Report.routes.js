import { Router } from 'express';
import { CreateReport, DeleteReport, GetReport, OrganizationReport, UpdateReport } from '../controller/Report.Controller.js';
import { Authentication, ClientCISOAuthentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

routes.route('/detailed-report').post(Authentication, upload.single('report'), CreateReport);
routes.route('/get-report').get(Authentication, GetReport);
routes.route('/delete-report/:id').delete(Authentication, DeleteReport);
routes.route('/update-report/:id').put(Authentication, upload.single('report'), UpdateReport);
routes.route('/get-report-org').get(ClientCISOAuthentication, OrganizationReport);





export default routes;
