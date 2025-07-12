import { Schema,model } from "mongoose";

const applicationSchema = new Schema({
  name: {type: String,required: true,trim: true},
  description: {type: String,trim: true,required: true},
  country: {type: String,trim: true,required: true},
  state: {type: String,trim: true,required: true},
  city: {type: String,trim: true,required: true},
  type: {type: String,enum: ['Mobile', 'Web', 'Microservice', 'APIs'],required: true,trim: true  },
  applicationUrl: {type: String,trim: true},
  modifyCriticality: {type: String,enum: ['Critical', 'High', 'Medium', 'Low'],required: true,trim: true },
  creator:{type:Schema.Types.ObjectId,ref:"Tenant",required:true},
  asset:{type:Schema.Types.ObjectId,ref:"InfraStructureAsset",required:true},
  tages: [{ type:Schema.Types.ObjectId, ref: "Tag", required: true }],
}, { timestamps: true });


export const ApplicationModel = model("BusinessApplication",applicationSchema);

