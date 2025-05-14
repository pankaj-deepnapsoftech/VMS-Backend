import {string,object} from "yup";


export const BookDemoValidation = object({
  name:string().min(2).max(50).required("Name is Required Field"),
  email:string().email().required("Email is Required Field"),
  phone:string().min(10).max(12).required("Phone is Required Field"),
});


