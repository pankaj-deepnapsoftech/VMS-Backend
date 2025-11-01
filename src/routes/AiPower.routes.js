import {Router} from "express";
import { CreateAiPower, DeleteAiPower, GetAiPower, UpdateAiPower } from "../controller/AiPower.controller.js";

const routes = Router();

routes.route("/create").post(CreateAiPower);
routes.route("/get").get(GetAiPower);
routes.route("/update/:id").put(UpdateAiPower);
routes.route("/delete/:id").patch(DeleteAiPower);


export default routes;






