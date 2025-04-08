import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { GetGptHistory, ProblemSolution } from "../controller/OpenApi.controller.js";

const router = Router();

router.route("/text-response").post(Authentication,ProblemSolution);
router.route("/get/:id").get(Authentication,GetGptHistory);

export default router;








