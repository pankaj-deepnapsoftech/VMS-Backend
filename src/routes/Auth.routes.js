import { Router } from 'express';
import { LoginValidate, RegistrationValidate } from '../helper/helper.js';
import {
  RegisterUser,
  LoginUser,
  VerifyOTP,
} from '../controller/Auth.controller.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(RegistrationValidate, RegisterUser);
routes.route('/login').post(LoginValidate, LoginUser);
routes.route('/verify-email').post(Authentication, VerifyOTP);

export default routes;
