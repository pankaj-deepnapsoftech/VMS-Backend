import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateInfra, Graph1CIClasses, Graph2CIClasses, Graph3CiClasses } from "../controller/infra.controller.js";
import { upload } from "../config/multer.config.js";

const router = Router();

router.route("/create-infra").post(Authentication,upload.single("excel"),CreateInfra);
router.route("/Vulnerable-ci-1").get(Authentication,Graph1CIClasses);
router.route("/Vulnerable-ci-2").get(Authentication, Graph2CIClasses);
router.route("/Vulnerable-ci-3").get(Authentication, Graph3CiClasses);

export default router;