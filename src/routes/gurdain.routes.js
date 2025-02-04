import { Router } from "express";
import { CreateGuard, DeleteGuardData, GetGuardData } from "../controller/Guardain.controller.js";
import { CreateGuardainValidater } from "../helper/helper.js";
import { Authentication } from "../middleware/Authentication.js";

const router = Router();

router.route("/create-guardain").post(Authentication,CreateGuardainValidater,CreateGuard);
router.route("/get-guardain").get(Authentication,GetGuardData);
router.route("/delete/:id").delete(Authentication,DeleteGuardData)

export default router 