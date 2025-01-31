import { Router } from "express";
import { CreateJiraConfig, GetIssuesJira, GetJIraConfig } from "../controller/Jira.controller.js";
import { Authentication } from "../middleware/Authentication.js";
import { JiraConfigValidate } from "../helper/helper.js";

const routes = Router();

routes.route("/issues").get(Authentication,GetIssuesJira);
routes.route("/create-jira-config").post(Authentication,JiraConfigValidate,CreateJiraConfig);
routes.route("/get-jira-config/:id").get(Authentication,GetJIraConfig);

export default routes