import { Router } from 'express';
// local imports
import { AdminAuthentication, EmployeeAuthentication } from '../middleware/Authentication.js';
import { GetEmployeeTasksData, getOrgnization, TasksCardData } from '../controller/Employee.controller.js';

const router = Router();

router.route('/get-employee-task').get(EmployeeAuthentication, GetEmployeeTasksData);
router.route('/emp-data').get(EmployeeAuthentication, TasksCardData);
router.route("/get-orgnization").get(AdminAuthentication,getOrgnization)

export default router;
