import { string, number, object } from 'yup';

export const RegisterValidation = object({
  full_name: string().min(2).max(25).required('Full Name is Required'),
  email: string().email().required('E-mail is Required'),
  phone: string().min(10).max(12).required('Phone No. is Required'),
  password: string().min(4).max(12).required('Password is Required'),
  role: string()
    .oneOf(['Customer', 'Employee', 'Admin'])
    .required('Role is Required'),
});