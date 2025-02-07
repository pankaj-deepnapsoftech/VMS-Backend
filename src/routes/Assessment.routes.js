import { Router } from 'express';
import { createAssessment, deleteAssessment, getAssessment, updateAssessment } from '../controller/Assessment.controller.js';
import { ClientSMEAuthentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';
import { Assessmentvalidater } from '../helper/helper.js';

const router = Router();

router.route('/create').post(ClientSMEAuthentication, Assessmentvalidater, upload.single('code_Upload'), createAssessment);
router.route('/get').get(ClientSMEAuthentication, getAssessment);
router.route('/delete/:id').delete(ClientSMEAuthentication, deleteAssessment);
router.route('/update/:id').delete(ClientSMEAuthentication, upload.single('code_Upload'), updateAssessment);

export default router;
