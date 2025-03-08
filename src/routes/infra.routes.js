import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateInfra, Graph1CIClasses } from "../controller/infra.controller.js";
import { upload } from "../config/multer.config.js";

const router = Router();

router.route("/create-infra").post(Authentication,upload.single("excel"),CreateInfra);
router.route("/Vulnerable-ci-1").get(Graph1CIClasses)

export default router;