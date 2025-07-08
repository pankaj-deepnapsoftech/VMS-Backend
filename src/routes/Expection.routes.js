import { Router } from "express";
import { CreateExpection, DeleteExpection, GetExpection, UpdateExpection } from "../controller/Expection.controller.js";


const router  = Router();

router.route("/create").post(CreateExpection);
router.route("/get").get(GetExpection);
router.route("/delete/:id").delete(DeleteExpection);
router.route("/update/:id").put(UpdateExpection);



export default router;




