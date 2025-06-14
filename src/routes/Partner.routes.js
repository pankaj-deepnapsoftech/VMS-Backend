import {Router} from "express";
import { AllPartner, CreatePartner, DeletePartner, GetPartner, UpdatePartner } from "../controller/Partner.controller.js";
import { Validater } from "../helper/checkValidation.js";
import { PartnersValidation } from "../validation/partners.validation.js";

const routes = Router();

routes.route("/create").post(Validater(PartnersValidation),CreatePartner);
routes.route("/get").get(GetPartner);
routes.route("/update/:id").put(UpdatePartner);
routes.route("/delete/:id").delete(DeletePartner);
routes.route("/get-all").get(AllPartner);

export default routes;


