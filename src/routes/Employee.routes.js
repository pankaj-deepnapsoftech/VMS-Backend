import {Router} from "express";
// local imports
import { EmployeeAuthentication } from "../middleware/Authentication.js";
import { GetEmployeeTasksData } from "../controller/Employee.controller.js";



const router = Router();

router.route("/get-employee-task").get(EmployeeAuthentication,GetEmployeeTasksData)


export default router