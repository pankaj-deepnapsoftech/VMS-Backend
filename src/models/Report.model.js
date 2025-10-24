import { Schema, model } from 'mongoose';
import { ImageSchem } from './ImageSchema.model.js';

const ReportSchema = new Schema(
  {
    file: ImageSchem,
    creator: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    Type_Of_Assesment: { type: Schema.Types.ObjectId, ref: "Assessment" },
    report_name: { type: String, required: true }
  },
  { timestamps: true }
);

export const ReportModel = model('Report', ReportSchema);
