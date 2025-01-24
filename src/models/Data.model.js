import { Schema, model } from 'mongoose';

const DataSchema = new Schema(
  {
    Work_Item_Type: { type: String },
    Organization: { type: String },
    Application_Name: { type: String },
    Title: { type: String },
    Vulnerability_Classification: { type: String },
    Assigned_To: { type: String },
    Scan_Type: { type: String },
    Severity: { type: String },
    Priority: { type: String },
    Status: { type: String },
    Remediated_Date: { type: Number },
    Ageing: { type: String },
    Remediate_Upcoming_Time_Line: { type: String },
  },
  { timestamps: true },
);

export const DataModel = model('Data', DataSchema);
