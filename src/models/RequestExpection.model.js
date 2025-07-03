import {Schema,model} from "mongoose";


const ExpectionSchema = new Schema({
  exception_start_data:{type:Date,required:true},
  exception_end_data:{type:Date,required:true},
  reason:{type:String,required:true},
  compensatory_control:{type:String,required:true,enum:['Yes',"No"]},
  detail:{type:String,required:true},
  proof:{type:String},
  creator:{type:Schema.Types.ObjectId,ref:"User",required:true},
  vulnerable_data:{type:Schema.Types.ObjectId,ref:"Data",required:true}
});


export const ExpectionModel = model("Expection",ExpectionSchema);