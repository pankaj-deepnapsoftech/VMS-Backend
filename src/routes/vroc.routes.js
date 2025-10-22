import {Router} from "express";
import { AssertInventory, FinancialExposure, GetRiskScoreData, TopFiveRiskIndicator } from "../controller/VROC.controller.js";


const routes = Router();

routes.route("/risk-score").get(GetRiskScoreData);
routes.route("/assert-inventory").get(AssertInventory);
routes.route("/financial-exposure").get(FinancialExposure);
routes.route("/top-risk-indicator").get(TopFiveRiskIndicator);


export default routes;





