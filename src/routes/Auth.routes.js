import { Router } from 'express';
import { ChnagePasswordValidate, LoginValidate, RegistrationValidate, ResetPasswordValidate, VerifyEmailValidate } from '../helper/helper.js';
import {
  RegisterUser,
  LoginUser,
  VerifyOTP,
  VerifyEmail,
  ResetPassword,
  LogoutUser,
  getlogedInUser,
  ChnagePassword,
  ResendOtp,
  DeactivatePath,
  UpdateUserProfile,
  ResetPasswordByQuestions,
  DeleteUser,
  GetAllUsers,
  UpdateUserByAdmin,
  getAllUserByTenant,
  Verifycaptcha,
  ChangePasswordViaQuestion,
  RenderQuestionPage,
  RenderResetPassword,
} from '../controller/Auth.controller.js';
import {  Authentication } from '../middleware/Authentication.js';
import { upload } from '../config/multer.config.js';

const routes = Router();

routes.route('/create').post(RegistrationValidate, RegisterUser);
routes.route('/login').post(LoginValidate, LoginUser);
routes.route('/verify-recaptcha').post(Verifycaptcha);
routes.route('/verify-otp').post(Authentication, VerifyOTP);
routes.route('/verify-email').post(VerifyEmailValidate, VerifyEmail);
routes.route("/update/:id").put(Authentication,upload.single("profile"),UpdateUserProfile);
routes.route('/reset-password/:token').post(ResetPasswordValidate, ResetPassword);
routes.route('/logout').get(Authentication, LogoutUser);
routes.route('/logedin-user').get(Authentication, getlogedInUser);
routes.route('/resend-otp').put(Authentication, ResendOtp);
routes.route('/change-password').put(Authentication, ChnagePasswordValidate, ChnagePassword);
routes.route("/deactivate/:id").put(Authentication,DeactivatePath);
routes.route("/reset-password-question/:email").put(ResetPasswordByQuestions);
routes.route("/delete-user/:id").delete(Authentication,DeleteUser);
routes.route("/all-users").get(Authentication,GetAllUsers);
routes.route("/update-user/:id").put(Authentication,UpdateUserByAdmin);
routes.route("/user-by-tenant").get(Authentication,getAllUserByTenant);
routes.route("/change-password-question").get(ChangePasswordViaQuestion);
routes.route("/render-security").get(RenderQuestionPage);
routes.route("/reset-password-via-question").post(RenderResetPassword);

export default routes;
