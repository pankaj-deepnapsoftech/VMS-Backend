import { Router } from "express";
import { CreateRole, DeleteRole, GetAllRols, GetRole, UpdateRole } from "../controller/role.controller.js";

const routes = Router();

routes.route("/create").post(CreateRole);
routes.route("/get").get(GetRole);
routes.route("/update/:id").put(UpdateRole);
routes.route("/delete/:id").delete(DeleteRole);
routes.route("/get-all").get(GetAllRols);


export default routes;














