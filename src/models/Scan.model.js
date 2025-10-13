import {Schema,model} from "mongoose";


const AuthSchema = new Schema({
  email:{type:String},
  password:{type:String},
  login_url:{type:String},
});

const ScheduleSchema = new Schema ({
  date:{type:Date},
  time:{type:String},
});

const ScanSchema = new Schema ({
  tenant_id:{type:Schema.Types.ObjectId,ref:"Tenant",required:true},
  user_id:{type:Schema.Types.ObjectId,ref:"User",required:true},
  target_name:{type:String},
  scan_targets:{type:[String],required:true},
  is_auth_scan:{type:Boolean,required:true,default:false},
  auth_scan:AuthSchema,
  label:{type:String},
  isSchedule:{type:Boolean,required:true,default:false},
  Schedule:ScheduleSchema
},{timestamps:true});


export const ScanModel = model("Scan",ScanSchema);
























