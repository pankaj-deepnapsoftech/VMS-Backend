import {Router} from "express";
import { GetRiskScoreData } from "../controller/VROC.controller.js";


const routes = Router();

routes.route("/risk-score").get(GetRiskScoreData);


export default routes;





