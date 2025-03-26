import { Router } from 'express';
import { CreateJiraConfig, GetIssuesJira, GetJIraConfig, JIraDataTargetsStatus, JIraDataViaStatus, jiraDataWithExcel } from '../controller/Jira.controller.js';
import { Authentication } from '../middleware/Authentication.js';
import { JiraConfigValidate } from '../helper/helper.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

// jira with intigration
routes.route('/issues').get(Authentication, GetIssuesJira);
routes.route('/create-jira-config').post(Authentication, JiraConfigValidate, CreateJiraConfig);
routes.route('/get-jira-config').get(Authentication, GetJIraConfig);
routes.route('/JIraDataViaStatus').get(Authentication, JIraDataViaStatus);
routes.route('/JIraDataTargetsStatus').get(Authentication, JIraDataTargetsStatus);

// jira without intigration

routes.route("/upload-data").post(Authentication,upload.single("excel-jira"),jiraDataWithExcel)

export default routes;
