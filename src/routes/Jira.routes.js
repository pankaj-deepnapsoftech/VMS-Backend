import { Router } from 'express';
import { CreateJiraConfig, GetIssuesJira, GetJIraConfig, JIraDataTargetsStatus, JIraDataViaStatus } from '../controller/Jira.controller.js';
import { Authentication } from '../middleware/Authentication.js';
import { JiraConfigValidate } from '../helper/helper.js';

const routes = Router();

routes.route('/issues').get(Authentication, GetIssuesJira);
routes.route('/create-jira-config').post(Authentication, JiraConfigValidate, CreateJiraConfig);
routes.route('/get-jira-config').get(Authentication, GetJIraConfig);
routes.route('/JIraDataViaStatus').get(Authentication, JIraDataViaStatus);
routes.route('/JIraDataTargetsStatus').get(Authentication, JIraDataTargetsStatus);

export default routes;
