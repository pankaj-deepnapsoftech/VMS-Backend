import { Router } from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateAssertData, DeleteAssertData, GetAssertData, UpdateAssertData } from "../controller/AssetData.controller.js";

const routes = Router();

routes.route("/create").post(Authentication,CreateAssertData);
routes.route("/get").get(Authentication,GetAssertData);
routes.route("/delete/:id").delete(Authentication,DeleteAssertData);
routes.route("/update/:id").put(Authentication,UpdateAssertData);


export default routes;




