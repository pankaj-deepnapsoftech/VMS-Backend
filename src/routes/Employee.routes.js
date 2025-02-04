import { Router } from 'express';
// local imports
import { EmployeeAuthentication } from '../middleware/Authentication.js';
import { GetEmployeeTasksData, TasksCardData } from '../controller/Employee.controller.js';

const router = Router();

router.route('/get-employee-task').get(EmployeeAuthentication, GetEmployeeTasksData);
router.route('/emp-data').get(EmployeeAuthentication, TasksCardData);

export default router;
