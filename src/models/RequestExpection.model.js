import {Schema,model} from "mongoose";
import { ImageSchem } from "./ImageSchema.model.js";

const ApprovalSchema = new Schema({
  approver:{type:Schema.Types.ObjectId,ref:"Tenant",required:true},
  status:{type:String,required:true,enum:['Pending','Approved','Rejected'],default:"Pending"},
});


const ExpectionSchema = new Schema({
  exception_start_data:{type:Date,required:true},
  exception_end_data:{type:Date,required:true},
  reason:{type:String,required:true},
  compensatory_control:{type:String,required:true,enum:['Yes',"No"]},
  detail:{type:String},
  proof:ImageSchem,
  creator:{type:Schema.Types.ObjectId,ref:"User",required:true},
  vulnerable_data:{type:Schema.Types.ObjectId,ref:"Data",required:true},
  aprove_1:ApprovalSchema,
  aprove_2:ApprovalSchema,
  aprove_3:ApprovalSchema, 
});


export const ExpectionModel = model("Expection",ExpectionSchema);