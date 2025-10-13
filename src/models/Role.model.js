
import { Schema,model } from "mongoose";

const pathsSchema = new Schema({
  name:{type:String},
  value:{type:String},
  permission:[String]
});

const RoleSchema = new Schema({
  role:{type:String,required:true},
  description:{type:String,required:true},
  allowed_path:{type:[pathsSchema],required:true},
  creator:{type:Schema.Types.ObjectId,ref:"User",required:true}, 
},{timestamps:true});

export const RoleModels = model("Role",RoleSchema);



