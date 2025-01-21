// local imports
import {
  RegisterValidation,
  LoginValidation,
} from '../validation/Auth.validation.js';
import { Validater } from './checkValidation.js';

export const RegistrationValidate = Validater(RegisterValidation);
export const LoginValidate = Validater(LoginValidation);
