import { Schema, model } from 'mongoose';

const ReportSchema = new Schema(
    {
        Organization: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        file: { type: String, required: true },
        creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true },
);

export const ReportModel = model('Report', ReportSchema);
