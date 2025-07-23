import { Schema, model } from "mongoose";


const InfraStructureAssetSchema = new Schema({
  asset_ip: { type: String, required: true },
  asset_hostname: { type: String, required: true },
  modify_criticality: { type: String, required: true, enum: ["Critical", "High", "Medium", "Low"] },
  creator: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  asset_class: {type:Number,required:true},
  service_role: {type:[Schema.Types.ObjectId],ref:"Tag"},
  exposure: {type:Number,required:true},
  hosting: {type:Number,required:true},
});


export const InfraStructureAssetModel = model("InfraStructureAsset", InfraStructureAssetSchema);

