import {Schema,model} from "mongoose";


const EmailingSchema = new Schema({
  report_type:{type:String,required:true},
  scheduled:{type:Boolean,required:true,default:false},
  schedule_type:{type:String,required:true,enum:['weekly','monthly']},
  time:{type:String,required:true},
  date:{type:String},
  day:{type:String},
  tenant:{type:Schema.Types.ObjectId,ref:"Tenant",unique:true},
  users:{type:[Schema.Types.ObjectId],ref:"User",required:true}
});

export const EmaliingModal =  model("Emailing",EmailingSchema);