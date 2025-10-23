import {Router} from "express";
import { AssertInventory, FinancialExposure, FinancialExposureTrand, GetRiskScoreData, RemediationWorkflow, RiskTrend, TopFiveRiskIndicator } from "../controller/VROC.controller.js";


const routes = Router();

routes.route("/risk-score").get(GetRiskScoreData);
routes.route("/assert-inventory").get(AssertInventory);
routes.route("/financial-exposure").get(FinancialExposure);
routes.route("/top-risk-indicator").get(TopFiveRiskIndicator);
routes.route("/risk-trand").get(RiskTrend);
routes.route("/finance-exposure-trand").get(FinancialExposureTrand);
routes.route("/remediation-workflow").get(RemediationWorkflow);



export default routes;





