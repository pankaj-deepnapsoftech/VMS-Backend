import {Schema,model} from "mongoose";


const SeveritySchema = new Schema({
  name:{type:String,required:true},
  description:{type:String,required:true},
  tenant:{type:Schema.Types.ObjectId,ref:"Tenant",required:true},
  days:{type:Number,required:true},
},{timestamps:true});

export const SeverityModel = model("Severity", SeveritySchema);



