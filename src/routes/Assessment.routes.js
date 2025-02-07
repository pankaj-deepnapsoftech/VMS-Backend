import { Router } from "express";
import { createAssessment, getAssessment } from "../controller/Assessment.controller.js";
import { ClientSMEAuthentication } from "../middleware/Authentication.js";
import { upload } from "../config/multer.config.js";

const router = Router();

router.route("/create").post(ClientSMEAuthentication,upload.single("code_Upload"),createAssessment);
router.route("/get").post(ClientSMEAuthentication,getAssessment);

export default router