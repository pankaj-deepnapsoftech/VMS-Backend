import { Router } from 'express';
import { RegistrationValidate } from '../helper/helper.js';
import { RegisterUser } from '../controller/Auth.controller.js';

const routes = Router();

routes.route('/create').post(RegistrationValidate, RegisterUser);

export default routes;
