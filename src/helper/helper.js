// local imports
import { RegisterValidation } from "../validation/Auth.validation.js";
import { Validater } from "./checkValidation.js";

export const RegistrationValidate = Validater(RegisterValidation);