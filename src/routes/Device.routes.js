import { Router } from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateDevice, DeleteDeviceData, GetDeviceData, UpdateDeviceData } from "../controller/Device.controller.js";

const routes = Router();

routes.route("/create").post(Authentication,CreateDevice);
routes.route("/get").get(Authentication,GetDeviceData);
routes.route("/delete/:id").delete(Authentication,DeleteDeviceData);
routes.route("/update/:id").put(Authentication,UpdateDeviceData);


export default routes;




