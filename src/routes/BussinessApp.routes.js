import { Router } from "express";
import { Validater } from "../helper/checkValidation.js";
import { CreateBusinessApp, DeleteBusinessApp, GetAllBusinessApp, GetBusinessApp, UpdateBusinessApp } from "../controller/BusinessApp.controller.js";
import { BusinessApplicationValidation } from "../validation/BusinessApp.validation.js";

const router = Router();


router.route("/create").post(Validater(BusinessApplicationValidation),CreateBusinessApp);
router.route("/get").get(GetBusinessApp);
router.route("/update/:id").put(UpdateBusinessApp);
router.route("/delete/:id").delete(DeleteBusinessApp);
router.route("/get-all").get(GetAllBusinessApp);




export default router;