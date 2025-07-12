import { Schema,model } from "mongoose";

const TenantSchema = new Schema({
  company_name:{type:String,required:true},
  Website_url:{type:String,required:true},
  Employee_count:{type:String,requied:true},
  Country:{type:String,required:true},
  State:{type:String,required:true},
  City:{type:String,required:true},
  Industry:{type:String,required:true},
  Risk_Apetite:{type:String,required:true},
  Partner:{type:Schema.Types.ObjectId,ref:"Partner"}
});

export const TenantModel = model("Tenant",TenantSchema);















