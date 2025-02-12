import { Router } from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateNotification, GetNotification, NotificationViewed } from "../controller/NotificationController.js";

const routes = Router();


routes.route("/create").post(Authentication,CreateNotification);
routes.route("/get").get(Authentication,GetNotification);
routes.route("/viewed/:id").patch(Authentication,NotificationViewed);

export default routes 