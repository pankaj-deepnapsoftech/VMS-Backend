import {Router} from "express";
import { CreateMailing, DeleteMailing, GetMailing, UpdateMailing } from "../controller/Emailing.controller.js";

const routes = Router();


routes.route("/create").post(CreateMailing);
routes.route("/get").get(GetMailing);
routes.route("/update/:id").put(UpdateMailing);
routes.route("/delete/:id").delete(DeleteMailing);


export default routes;






