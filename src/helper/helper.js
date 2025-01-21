// local imports
import {
  RegisterValidation,
  LoginValidation,
  VerifyEmailValidation,
  ResetPasswordValidation,
} from '../validation/Auth.validation.js';
import { Validater } from './checkValidation.js';

// auth validaters 
export const RegistrationValidate = Validater(RegisterValidation);
export const LoginValidate = Validater(LoginValidation);
export const VerifyEmailValidate = Validater(VerifyEmailValidation)
export const ResetPasswordValidate = Validater(ResetPasswordValidation)
