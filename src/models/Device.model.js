import {Schema,model} from "mongoose";


const DeviceSchema = new Schema({
  unit_id:{type:String},
  asset_custodian_name:{type:String},
  asset_custodian_contact:{type:String},
  asset_name:{type:String},
  asset_type:{type:String},
  description:{type:String},
  physical_location:{type:String},
  cloud_service_provider:{type:String},
  hardware_securend:{type:String},
  approved_connect:{type:String},
  asset_components:{type:String},
  machine_name:{type:String},
  hardware_address:{type:String},
  network_address:{type:String},
  supplier:{type:String}
});

export const DeviceModel = model("device",DeviceSchema);

















