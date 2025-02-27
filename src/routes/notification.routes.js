import { Router } from 'express';
import { Authentication } from '../middleware/Authentication.js';
import { CreateNotification, GetNotification, NotificationViewed, orginzationNotification } from '../controller/Notification.controller.js';

const routes = Router();

routes.route('/create').post(Authentication, CreateNotification);
routes.route('/get').get(Authentication, GetNotification);
routes.route('/viewed/:id').patch(Authentication, NotificationViewed);
routes.route("/orgnization-notification").post(Authentication,orginzationNotification);

export default routes;
