import { Router } from 'express';
import {  AllVulnerablity, CreateReport, DeleteReport, GetReport,  UpdateReport } from '../controller/Report.Controller.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/detailed-report').post(Authentication, CreateReport);
routes.route('/get-report').get(Authentication, GetReport);
routes.route('/delete-report/:id').delete(Authentication, DeleteReport);
routes.route('/update-report/:id').put(Authentication,UpdateReport);
routes.route('/download-all-vulnerabilities').get(Authentication,AllVulnerablity);

export default routes;
