import { Router } from "express";
import { CreateRole, DeleteRole, GetRole, UpdateRole } from "../controller/role.controller.js";

const routes = Router();

routes.route("/create").post(CreateRole);
routes.route("/get").get(GetRole);
routes.route("/update/:id").put(UpdateRole);
routes.route("/delete/:id").delete(DeleteRole);


export default routes;














