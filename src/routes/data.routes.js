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
} from '../controller/Data.controller.js';
import { upload } from '../config/multer.config.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(Authentication, upload.single('excel'), CreateData);
routes.route('/add-new').post(Authentication, AddNewData);
routes.route('/get').get(Authentication, getAllData);
routes.route('/assign/:id').patch(AssignedTask);
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
routes.route("/top-vulnerabilities").get(Authentication,TopVulnerabilities)
routes.route("/GetAssetsOpenIssues").post(GetAssetsOpenIssues)
routes.route("/GetOrganization").get(Authentication,GetOrganization)

export default routes;
