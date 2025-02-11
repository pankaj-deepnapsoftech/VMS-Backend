import { Schema, model } from 'mongoose';

const AssessmentSchema = new Schema({
  Type_Of_Assesment: { type: 'String', required: true },
  Orgenization_id:{type:Schema.Types.ObjectId,ref:"User",required:true},
  Application_Url: { type: 'String' },
  code_Upload: { type: 'String' },
  Data_Classification: { type: 'String', required: true },
  Select_Tester: { type: Schema.Types.ObjectId, ref: 'User' },
  MFA_Enabled: { type: Boolean, required: true },
  creator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  task_start:{type:String,required:true},
  task_end:{type:String,required:true},
});

export const AssessmentModel = model('Assessment', AssessmentSchema);
