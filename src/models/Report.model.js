import { Schema, model } from 'mongoose';

const ReportSchema = new Schema(
  {
    Organization: { type: Schema.Types.ObjectId, ref: 'User' },
    file: { type: String, required: true },
    cretor: { type: String, required: true },
  },
  { timestamps: true },
);

export const ReportModel = model('Report', ReportSchema);
