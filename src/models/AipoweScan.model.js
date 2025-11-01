import { Schema, model } from "mongoose";

const aiPoweredSchema = new Schema({
  tenant: {type:Schema.Types.ObjectId,ref:"Tenant"},
  user: {type:Schema.Types.ObjectId,ref:"User"},
  target_name: {type:String,reuireq:true},
  scan_tags:{type:[String],required:true},
  labels:{type:String},
  auth_scan:{type:Boolean,required:true,default:false},
  auth_fields:{
    type:{
      email:{type:String},
      password:{type:String},
      login_url:{type:String}
    }
  },
  schedule:{type:Boolean,required:true,default:false},
  status:{type:String,required:true,enum:['Pending','Completed','Failed'],default:'Pending'},
  end_date:{type:Date},
  schedule_field:{
    type:{
      date:{type:Date},
      time:{type:String},
    }
  }

});

export const AiPoweredModel = model("AiPowered", aiPoweredSchema);