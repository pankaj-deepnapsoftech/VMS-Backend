import { Router } from 'express';
// local imports
import { CreateData, getAllData, DeteleOneData, updateOneData, DataCounsts, vulnerableItems, VulnerableRiskRating, NewAndCloseVulnerable, ClosevulnerableItems, vulnerableTargets, CriticalVulnerable, CriticalHighVulnerable, CriticalHighVulnerableOverdue, AddNewData, AssignedTask } from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(Authentication, upload.single('excel'), CreateData);
routes.route('/add-new').post(Authentication,AddNewData);
routes.route('/get').get(Authentication, getAllData);
routes.route('/assign/:id').patch(Authentication, AssignedTask);
routes.route('/delete/:id').delete(Authentication, DeteleOneData);
routes.route('/update/:id').patch(Authentication, updateOneData);
routes.route('/total-data-count').get(Authentication, DataCounsts);
routes.route('/vulnerableItems').get(Authentication, vulnerableItems);
routes.route('/VulnerableRiskRating').get(Authentication, VulnerableRiskRating);
routes.route('/NewAndCloseVulnerable').get(Authentication, NewAndCloseVulnerable);
routes.route('/ClosevulnerableItems').get(Authentication,ClosevulnerableItems);
routes.route('/vulnerableTargets').get(Authentication,vulnerableTargets);
routes.route('/CriticalVulnerable').get(Authentication,CriticalVulnerable);
routes.route('/CriticalHighVulnerable').get(Authentication, CriticalHighVulnerable);
routes.route('/CriticalHighVulnerableOverdue').get(Authentication,CriticalHighVulnerableOverdue);

export default routes;
