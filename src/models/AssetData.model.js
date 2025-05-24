import { Schema, model } from "mongoose";

const AssertDataSchema = new Schema({
  data_asset: String,
  contents: String,
  use: String,
  data_owner: String,
  format: String,
  location: String,
  timeframe: String,
  size_on_disk: String,
  records: String,
  last_inventory_update: String
});

export const AssertDataModel = model("AssertData", AssertDataSchema);





