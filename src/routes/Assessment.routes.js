import { Router } from 'express';
import { createAssessment, deleteAssessment, getAssessment, tasterList, updateAssessment } from '../controller/Assessment.controller.js';
import { Authentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';
import { Assessmentvalidater } from '../helper/helper.js';

const router = Router();

router.route('/create').post(Authentication, upload.single('code_Upload'), Assessmentvalidater, createAssessment);
router.route('/get').get(Authentication, getAssessment);
router.route('/delete/:id').delete(Authentication, deleteAssessment);
router.route('/update/:id').patch(Authentication, upload.single('code_Upload'), updateAssessment);
router.route('/testers-list').get(Authentication, tasterList);

export default router;
