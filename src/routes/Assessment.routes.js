import { Router } from 'express';
import { AdminGetAssessment, createAssessment, DashboardData, deleteAssessment, GetAllInProgressAssessment, getAssessment, getCompleted, getInProgress, tasterList, updateAssessment } from '../controller/Assessment.controller.js';
import { Authentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';
import { Assessmentvalidater } from '../helper/helper.js';

const router = Router();

router.route('/create').post(Authentication, Assessmentvalidater, createAssessment);
router.route('/get').get(Authentication, getAssessment);
router.route('/get-in-progress').get(Authentication, getInProgress);
router.route('/get-completed').get(Authentication, getCompleted);
router.route('/delete/:id').delete(Authentication, deleteAssessment);
router.route('/update/:id').patch(Authentication, upload.single('code_Upload'), updateAssessment);
router.route('/testers-list').get(Authentication, tasterList);
router.route('/DashboardData').get(Authentication, DashboardData);
router.route("/admin-get").get(Authentication,AdminGetAssessment);
router.route("/inprogress-assessment").get(Authentication,GetAllInProgressAssessment);

export default router;
