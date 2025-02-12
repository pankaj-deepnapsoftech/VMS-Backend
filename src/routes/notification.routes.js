import { Router } from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateNotification, GetNotification, NotificationViewed } from "../controller/NotificationController.js";

const routes = Router();


routes.route("/create").post(Authentication,CreateNotification)
routes.route("/get").post(Authentication,GetNotification)
routes.route("/viewed/:id").post(Authentication,NotificationViewed)

export default routes 