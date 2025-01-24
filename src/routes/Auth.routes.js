import { Router } from 'express';
import {
  ChnagePasswordValidate,
  LoginValidate,
  RegistrationValidate,
  ResetPasswordValidate,
  VerifyEmailValidate,
} from '../helper/helper.js';
import {
  RegisterUser,
  LoginUser,
  VerifyOTP,
  VerifyEmail,
  ResetPassword,
  LogoutUser,
  getlogedInUser,
  UpdateUserPath,
  ChnagePassword,
  ResendOtp,
  employeeVerification,
} from '../controller/Auth.controller.js';
import { Authentication } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/create').post(RegistrationValidate, RegisterUser);
routes.route('/login').post(LoginValidate, LoginUser);
routes.route('/verify-otp').post(Authentication, VerifyOTP);
routes.route('/verify-email').post(VerifyEmailValidate, VerifyEmail);
routes
  .route('/reset-password/:token')
  .post(ResetPasswordValidate, ResetPassword);
routes.route('/logout').get(Authentication, LogoutUser);
routes.route('/logedin-user').get(Authentication, getlogedInUser);
routes.route('/update-paths').put(Authentication, UpdateUserPath);
routes.route('/resend-otp').put(Authentication, ResendOtp);
routes
  .route('/change-password')
  .put(Authentication, ChnagePasswordValidate, ChnagePassword);
routes.route("/verify-employee").patch(Authentication,employeeVerification)

export default routes;
