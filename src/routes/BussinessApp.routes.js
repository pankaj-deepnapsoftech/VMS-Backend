import { Router } from "express";
import { Validater } from "../helper/checkValidation.js";
import { BulkCreateBusinessApp, CreateBusinessApp, DeleteBusinessApp, GetAllBusinessApp, GetBusinessApp, TVMChartForth, UpdateBusinessApp } from "../controller/BusinessApp.controller.js";
import { BusinessApplicationValidation } from "../validation/BusinessApp.validation.js";
import { upload } from "../config/multer.config.js";

const router = Router();


router.route("/create").post(Validater(BusinessApplicationValidation),CreateBusinessApp);
router.route("/bulk-create").post(upload.single("excel"),BulkCreateBusinessApp);
router.route("/get").get(GetBusinessApp);
router.route("/update/:id").put(UpdateBusinessApp);
router.route("/delete/:id").delete(DeleteBusinessApp);
router.route("/get-all").get(GetAllBusinessApp);
router.route("/tvm-forth-chart").get(TVMChartForth);




export default router;