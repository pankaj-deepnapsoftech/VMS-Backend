import { Router } from "express";
import { BulkCreateInfraAsset, CreateInfraAsset, DeleteInfraAsset, GetAllInfraAsset, GetInfraAsset, UpdateInfraAsset } from "../controller/InfraStructureAsset.controller.js";
import { Validater } from "../helper/checkValidation.js";
import { InfraAssetvalidation } from "../validation/InfraStructureAsset.validation.js";
import { upload } from "../config/multer.config.js";

const router = Router();


router.route("/create").post(Validater(InfraAssetvalidation),CreateInfraAsset);
router.route("/bulk-create").post(upload.single("excel"),BulkCreateInfraAsset);
router.route("/get").get(GetInfraAsset);
router.route("/update/:id").put(UpdateInfraAsset);
router.route("/delete/:id").delete(DeleteInfraAsset);
router.route("/get-all").get(GetAllInfraAsset);




export default router;