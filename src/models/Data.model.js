import { Schema, model } from 'mongoose';

const DataSchema = new Schema(
  {
    Organization: { type: String },
    Application_Name: { type: String },
    Title: { type: String },
    Vulnerability_Classification: { type: String },
    Assigned_To: { type: Schema.Types.ObjectId, ref: 'User' },
    Scan_Type: { type: String },
    Severity: { type: String },
    Priority: { type: String },
    Status: { type: String },
    Remediated_Date: { type: Number },
    Ageing: { type: String },
    Remediate_Upcoming_Time_Line: { type: String },
    Expection_time: { type: Date },
    creator_id: { type: Schema.Types.ObjectId, ref: 'User' },
    client_Approve: { type: Boolean, default: false, required: true },
    docs: { type: String },
    exploitability:{type:Number}
  },
  { timestamps: true },
);

DataSchema.index({ Organization: 'text' });

export const DataModel = model('Data', DataSchema);
