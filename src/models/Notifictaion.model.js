import {Schema,model} from "mongoose";


const NotificationSchema = new Schema({
    reciver_id:{type:Schema.Types.ObjectId,ref:"User",required:true},
    title:{type:String,required:true},
    view:{type:Boolean,required:true,default:false}
});

export const NotificationModel = model("Notification",NotificationSchema);