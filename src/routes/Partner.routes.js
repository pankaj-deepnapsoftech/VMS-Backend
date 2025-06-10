import {Router} from "express";
import { CreatePartner, DeletePartner, GetPartner, UpdatePartner } from "../controller/Partner.controller.js";

const routes = Router();

routes.route("/create").post(CreatePartner);
routes.route("/get").get(GetPartner);
routes.route("/update/:id").put(UpdatePartner);
routes.route("/delete/:id").delete(DeletePartner);

export default routes;


