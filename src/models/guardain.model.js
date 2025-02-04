import {Schema,model} from "mongoose";

const GuardianSchema = new Schema({
    AIR_ID:{type:String,required:true},
    Application_URL:{type:String,required:true},
    Data_Classification:{type:String,required:true},
    Application_required_MFA:{type:Boolean,required:true,},
    MFA_Enabled:{type:Boolean,required:true,},
    MFA_Solution:{type:String,required:true},
})

export const GuardianModel = model("Guardian",GuardianSchema)