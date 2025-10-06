import { Router } from "express";
import { DeleteNessusData, GetNessusData } from "../controller/nessus.controller.js";


const routes = Router();


routes.route("/getNessusData").get(GetNessusData);
routes.route("/delete-nessus/:id").delete(DeleteNessusData);


export default routes;








