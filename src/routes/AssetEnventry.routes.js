import {Router} from "express";
import { Authentication } from "../middleware/Authentication.js";
import { CreateAssert, CreateSingleAssert, DeleteAssertData, GetAssertData, UpdateAssertData } from "../controller/Assert.controller.js";
import { upload } from "../config/multer.config.js";

const routes = Router();


routes.route("/create").post(Authentication,upload.single("excel"),CreateAssert);
routes.route("/create-one").post(Authentication,CreateSingleAssert);
routes.route("/get-Data").get(Authentication,GetAssertData);
routes.route("/update-data/:id").put(Authentication,UpdateAssertData);
routes.route("/delete/:id").delete(Authentication,DeleteAssertData);


export default routes;


