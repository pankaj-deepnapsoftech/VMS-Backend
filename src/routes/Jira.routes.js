import { Router } from "express";
import { GetIssuesJira } from "../controller/Jira.controller.js";

const routes = Router();

routes.route("/issues").get(GetIssuesJira)

export default routes