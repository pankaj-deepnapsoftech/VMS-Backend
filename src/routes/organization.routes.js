
import { Router } from "express";
import { OrgnizationData } from "../controller/organization.controller.js";
import { Authentication } from "../middleware/Authentication.js";


const routes = Router() 

routes.route("/organization-vulnerability").get(Authentication,OrgnizationData)

export default routes












