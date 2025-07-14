import { Router } from "express";
import { AssignPartner, CreateTenant, DeleteTenant, GetAllTanent, GetTenant, UpdateTenant } from "../controller/Tenant.controller.js";
import { Validater } from "../helper/checkValidation.js";
import { tenantValidator } from "../validation/Tenant.Validation.js";

const routes = Router();

routes.route("/create").post(Validater(tenantValidator),CreateTenant);
routes.route("/get").get(GetTenant);
routes.route("/update/:id").put(UpdateTenant);
routes.route("/delete/:id").delete(DeleteTenant);
routes.route("/get-all").get(GetAllTanent);
routes.route("/assign-tenant/:id").put(AssignPartner);


export default routes;



