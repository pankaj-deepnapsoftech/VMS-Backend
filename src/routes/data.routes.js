import { Router } from 'express';
// local imports
import {
  CreateData,
  getAllData,
  DeteleOneData,
  updateOneData,
  DataCounsts,
  vulnerableItems,
  VulnerableRiskRating,
  NewAndCloseVulnerable,
  ClosevulnerableItems,
  vulnerableTargets,
  CriticalVulnerable,
  CriticalHighVulnerable,
  CriticalHighVulnerableOverdue,
  AddNewData,
  AssignedTask,
  CriticalHighVulnerableItems,
  LowMediumVulnerableItems,
  CriticalHighVulnerableItemsOverdue,
  LowMediumVulnerableItemsOverdue,
  ApplicationvulnerabilityCardData,
  BulkAsignedTask,
  TopVulnerabilities,
  GetAssetsOpenIssues,
  GetOrganization,
  ExpectionApprove,
  ExpectionVerify,
  UploadPdf,
  AdminExpectionDataFiftyDays,
  ClientExpectionDataFiftyDays,
  AdminRiskRating,
  ClientRiskRating,
  AdminDeferredVulnerableItems,
  ClientDeferredVulnerableItems,
} from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(Authentication, upload.single('excel'), CreateData);
routes.route('/add-new').post(Authentication, AddNewData);
routes.route('/get').get(Authentication, getAllData);
routes.route('/assign/:id').patch(Authentication,AssignedTask);
routes.route('/delete/:id').delete(Authentication, DeteleOneData);
routes.route('/update/:id').patch(Authentication, updateOneData);
routes.route('/total-data-count').get(Authentication, DataCounsts);
routes.route('/vulnerableItems').get(Authentication, vulnerableItems);
routes.route('/VulnerableRiskRating').get(Authentication, VulnerableRiskRating);
routes.route('/NewAndCloseVulnerable').get(Authentication, NewAndCloseVulnerable);
routes.route('/ClosevulnerableItems').get(Authentication, ClosevulnerableItems);
routes.route('/vulnerableTargets').get(Authentication, vulnerableTargets);
routes.route('/CriticalVulnerable').get(Authentication, CriticalVulnerable);
routes.route('/CriticalHighVulnerable').get(Authentication, CriticalHighVulnerable);
routes.route('/CriticalHighVulnerableOverdue').get(Authentication, CriticalHighVulnerableOverdue);
routes.route('/CriticalHighVulnerableItems').get(Authentication, CriticalHighVulnerableItems);
routes.route('/LowMediumVulnerableItems').get(Authentication, LowMediumVulnerableItems);
routes.route('/CriticalHighVulnerableItemsOverdue').get(Authentication, CriticalHighVulnerableItemsOverdue);
routes.route('/LowMediumVulnerableItemsOverdue').get(Authentication, LowMediumVulnerableItemsOverdue);
routes.route('/ApplicationvulnerabilityCardData').get(ApplicationvulnerabilityCardData);
routes.route('/bulk-asigned-task').patch(Authentication, BulkAsignedTask);
routes.route('/top-vulnerabilities').get(Authentication, TopVulnerabilities);
routes.route('/GetAssetsOpenIssues').post(Authentication,GetAssetsOpenIssues);
routes.route('/GetOrganization').get(Authentication, GetOrganization);
routes.route('/ExpectionApprove').get(Authentication, ExpectionApprove);
routes.route('/ExpectionVerify').get(Authentication, ExpectionVerify);
routes.route('/upload-pdf/:id').post(Authentication, upload.single('PDF'), UploadPdf);
routes.route('/AdminExpectionDataFiftyDays').get(Authentication, AdminExpectionDataFiftyDays);
routes.route('/ClientExpectionDataFiftyDays').get(Authentication, ClientExpectionDataFiftyDays);
routes.route('/AdminRiskRating').get(Authentication, AdminRiskRating);
routes.route('/ClientRiskRating').get(Authentication, ClientRiskRating);
routes.route('/AdminDeferredVulnerableItems').get(Authentication, AdminDeferredVulnerableItems);
routes.route('/ClientDeferredVulnerableItems').get(Authentication, ClientDeferredVulnerableItems);

export default routes;
