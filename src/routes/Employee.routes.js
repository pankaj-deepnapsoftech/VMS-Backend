import { Router } from 'express';
// local imports
import { AdminAuthentication, Authentication, EmployeeAuthentication } from '../middleware/Authentication.js';
import { EmployeeCount, GetEmployeeTasksData, getOrgnization, TasksCardData } from '../controller/Employee.controller.js';


const router = Router();

router.route('/get-employee-task').get(EmployeeAuthentication, GetEmployeeTasksData);
router.route('/emp-data').get(EmployeeAuthentication, TasksCardData);
router.route('/get-orgnization').get(AdminAuthentication, getOrgnization);
router.route("/employee-count").get(Authentication,EmployeeCount)


export default router;
