import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { ProblemSolution } from "../controller/OpenApi.controller.js";

const router = Router();

router.route("/test-response").post(Authentication,ProblemSolution);

export default router;








