import { Router } from "express";
import { CreateExpection } from "../controller/Expection.controller.js";


const router  = Router();

router.route("/create").post(CreateExpection);



export default router;




