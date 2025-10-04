import { Router } from "express";
import { GetNessusData } from "../controller/nessus.controller.js";


const routes = Router();


routes.route("/getNessusData").get(GetNessusData);


export default routes;








