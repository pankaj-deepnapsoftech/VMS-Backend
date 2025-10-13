import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
  reciver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description:{type:String},
  view: { type: Boolean, required: true, default: false },
  options:{type:Boolean,required:true,default:false},
  expection_id:{type:Schema.Types.ObjectId,ref:"Expection"}
},{timestamps:true});

export const NotificationModel = model('Notification', NotificationSchema);
