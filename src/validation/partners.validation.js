import {object,string} from "yup";


export const PartnersValidation = object({
  company_name: string().required("Company Name is required"),
  website_url: string().required("Website URL is required"),
  country: string().required("Country is required"),
  state: string().required("State is required"),
  city: string().required("City is required"),
});