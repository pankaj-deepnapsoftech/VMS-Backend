import { Router } from 'express';
// local imports
import AuthRoutes from './Auth.routes.js';
import DataRoutes from './data.routes.js';
import JiraRoutes from './Jira.routes.js';
import EmployeeRoutes from './Employee.routes.js';
import AssessmentRoutes from './Assessment.routes.js';
import NotificationRoutes from './notification.routes.js';
import OrginizationRoutes from './organization.routes.js';
import ReportRoutes from './Report.routes.js';
import InfraRoutes from './infra.routes.js';
import OpenAiRoutes from "./OpenApi.routes.js";

const routes = Router();

routes.use('/auth', AuthRoutes);
routes.use('/data', DataRoutes);
routes.use('/jira', JiraRoutes);
routes.use('/employee', EmployeeRoutes);
routes.use('/assessment', AssessmentRoutes);
routes.use('/notification', NotificationRoutes);
routes.use('/org', OrginizationRoutes);
routes.use('/report', ReportRoutes);
routes.use('/infra', InfraRoutes);
routes.use("/open-api",OpenAiRoutes);

export default routes;
