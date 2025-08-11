import {Router} from 'express';
import { CreateSeverity, DeleteSeverity, GetSeverities, UpdateSeverity } from '../controller/Severity.controller.js';


const routes = Router();

routes.route("/create").post(CreateSeverity);
routes.route("/get").get(GetSeverities);
routes.route("/update/:id").put(UpdateSeverity);
routes.route("/delete/:id").delete(DeleteSeverity);


export default routes;