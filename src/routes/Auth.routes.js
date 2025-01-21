import { Router } from 'express';
import { LoginValidate, RegistrationValidate } from '../helper/helper.js';
import { RegisterUser,LoginUser } from '../controller/Auth.controller.js';

const routes = Router();

routes.route('/create').post(RegistrationValidate, RegisterUser);
routes.route('/login').post(LoginValidate, LoginUser);

export default routes;
