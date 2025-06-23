import { string, object } from 'yup';
export const AssessmentValidation = object({
  Type_Of_Assesment: string().required('Type Of Assesment is Required'),
  Data_Classification: string().required('Type Of Assesment is Required'),
  MFA_Enabled: string().required('Type Of Assesment is Required'),
  // Select_Tester: string().required('Select Tester is Required'),
});
