import {Router} from "express";
import { AssertInventory, GetRiskScoreData } from "../controller/VROC.controller.js";


const routes = Router();

routes.route("/risk-score").get(GetRiskScoreData);
routes.route("/assert-inventory").get(AssertInventory);


export default routes;





