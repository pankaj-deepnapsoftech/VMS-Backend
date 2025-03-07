import { Router } from 'express';
import {
  ApplicationvulnerabilityCardData,
  CriticalHighVulnerableItems,
  CriticalHighVulnerableItemsOverdue,
  LowMediumVulnerableItems,
  LowMediumVulnerableItemsOverdue,
  OrgnizationData,
} from '../controller/organization.controller.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/organization-vulnerability').get(Authentication, OrgnizationData);
routes.route('/CriticalHighVulnerableItems').get(Authentication, CriticalHighVulnerableItems);
routes.route('/LowMediumVulnerableItems').get(Authentication, LowMediumVulnerableItems);
routes.route('/CriticalHighVulnerableItemsOverdue').get(Authentication, CriticalHighVulnerableItemsOverdue);
routes.route('/LowMediumVulnerableItemsOverdue').get(Authentication, LowMediumVulnerableItemsOverdue);
routes.route('/ApplicationvulnerabilityCardData').get(Authentication, ApplicationvulnerabilityCardData);

export default routes;
