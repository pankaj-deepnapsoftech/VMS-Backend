import { Router } from 'express';
// local imports
import {
  CreateData,
  getApplicationData,
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
  TopExploitability,
  DeleteManyData,
  getInfrastructureData,
} from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(Authentication, upload.single('excel'), CreateData);
routes.route('/add-new').post(Authentication, AddNewData);
routes.route('/get-application').get(Authentication, getApplicationData);
routes.route('/get-infrastructure').get(Authentication, getInfrastructureData);
routes.route('/assign/:id').patch(Authentication,AssignedTask);
routes.route('/delete/:id').delete(Authentication, DeteleOneData);
routes.route("/delete-many").post(Authentication,DeleteManyData);
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
routes.route('/TopExploitability').get(Authentication, TopExploitability);

export default routes;
