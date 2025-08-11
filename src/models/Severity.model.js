import {Schema,model} from "mongoose";


const SeveritySchema = new Schema({
  severity:{type:String,required:true},
  descrption:{type:String,required:true},
  tenant:{type:String,required:true},
  days:{type:Number,required:true},
},{timestamps:true});

export const SeverityModel = model("Severity", SeveritySchema);



