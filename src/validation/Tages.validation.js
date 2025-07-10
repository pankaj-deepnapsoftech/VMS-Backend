import { string, object,number } from 'yup';

export const TagValidation = object({
  tag_name: string().required('Tag Name is Required'),
  tag_score: number().required('Tag Score is Required'),
});