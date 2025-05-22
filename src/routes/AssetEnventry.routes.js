import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateAssert } from "../controller/Assert.controller.js";
import { upload } from "../config/multer.config.js";

const routes = Router();


routes.route("/create").post(Authentication,upload.single("excel"),CreateAssert);




export default routes;


