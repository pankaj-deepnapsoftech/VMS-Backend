import Router from 'express';
import { CraeteTags } from '../controller/tags.controller.js';
import { Validater } from '../helper/checkValidation.js';
import { TagValidation } from '../validation/Tages.validation.js';


const router = Router();

router.route("/create").post(Validater(TagValidation),CraeteTags);



export default router;