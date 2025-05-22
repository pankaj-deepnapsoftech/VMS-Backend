import { Schema, model } from "mongoose";

const AssertSchema = new Schema({
  Unit_ID: String,
  Custodian_name: String,
  Custodian_Contact_info: String,
  Application_Name: String,
  Application_Type: {type:String},
  Version: String,
  URL_if_appl: String,
  Publisher: String,
  Install_Use_Date: String,
  Business_Purpose: String,
  End_Of_Life_date: String,
  LIcense_info: String,
  Ownership: String,
  Users: String,
  Risk_Data: String,
  Security_description:String,
  Pll_SSN:String,
  FERPA:String,
  HIPAA:String,
  PCI:String,
  GLBA:String,
  GDPR:String,
  CUI:String,
  "800_171":String,
  Creator:{type:Schema.Types.ObjectId,ref:"User"},
});

export const AssertModel = model("Assert",AssertSchema);