import { Router } from 'express';
// local imports
import AuthRoutes from './Auth.routes.js';
import DataRoutes from './data.routes.js';
import JiraRoutes from './Jira.routes.js';
import EmployeeRoutes from './Employee.routes.js';
import AssessmentRoutes from './Assessment.routes.js';
import NotificationRoutes from './notification.routes.js';

const routes = Router();

routes.use('/auth', AuthRoutes);
routes.use('/data', DataRoutes);
routes.use('/jira', JiraRoutes);
routes.use('/employee', EmployeeRoutes);
routes.use('/assessment', AssessmentRoutes);
routes.use('/notification', NotificationRoutes);

export default routes;
