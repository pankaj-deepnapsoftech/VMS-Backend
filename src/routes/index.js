import { Router } from 'express';
// local imports
import { Authentication } from '../middleware/Authentication.js';
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
import BookDemoRoutes from "./BookDemo.routes.js";
import TanentRoutes from "./Tenant.routes.js";
import RoleRoutes from "./Role.Routes.js";
import PartnerRoutes from "./Partner.routes.js";
import InfraStructureAssetRoutes from "./InfraStructureAsset.routes.js";
import BusinessApplicationRoutes from "./BussinessApp.routes.js";
import ExpectionRoutes from "./Expection.routes.js";
import TagRouter from "./Tags.routes.js";
import VROCRouter from "./vroc.routes.js";
import SevertyRoutes from "./Severity.routes.js";
import NessusRoutes from "./nessus.route.js";
import { GetTVMCardData } from '../controller/Data.controller.js';

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
routes.use("/open-api", OpenAiRoutes);
routes.use("/book-demo", BookDemoRoutes);
routes.use("/tenant", Authentication, TanentRoutes);
routes.use("/role", Authentication, RoleRoutes);
routes.use("/partner", Authentication, PartnerRoutes);
routes.use("/infraStructureAsset", Authentication, InfraStructureAssetRoutes);
routes.use("/BusinessApplication", Authentication, BusinessApplicationRoutes);
routes.use("/expection", Authentication, ExpectionRoutes);
routes.use("/tags", Authentication, TagRouter);
routes.use("/vroc", Authentication, VROCRouter);
routes.use("/severity", Authentication, SevertyRoutes);
routes.use("/nessus", NessusRoutes);
routes.get("/test",  GetTVMCardData);


export default routes;
