import Router from 'express';
import { AllTag, CraeteTags, deleteTag, GetAllTags, UpdateTag } from '../controller/tags.controller.js';
import { Validater } from '../helper/checkValidation.js';
import { TagValidation } from '../validation/Tages.validation.js';


const router = Router();

router.route("/create").post(Validater(TagValidation),CraeteTags);
router.route("/get-tags").get(GetAllTags);
router.route("/delete/:id").delete(deleteTag);
router.route("/update-tag/:id").put(UpdateTag);
router.route("/get-all-tags").get(AllTag);



export default router;