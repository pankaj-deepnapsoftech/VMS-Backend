import { Router } from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateAssetRiskRating, DeleteAssetRiskRating, GetAssetRiskRating, UpdateAssetRiskRating } from "../controller/AssetRiskRating.controller.js";

const routes = Router();

routes.route("/create").post(Authentication,CreateAssetRiskRating);
routes.route("/get").get(Authentication,GetAssetRiskRating);
routes.route("/delete/:id").delete(Authentication,DeleteAssetRiskRating);
routes.route("/update/:id").put(Authentication,UpdateAssetRiskRating);


export default routes;

















