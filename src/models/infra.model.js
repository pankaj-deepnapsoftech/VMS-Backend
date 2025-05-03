import { Schema, model } from 'mongoose';

const InfraSchema = new Schema(
  {
    Severity: { type: String, required: true },
    Affcted_IP_Host: { type: String, required: true },
    Protocol: { type: String, required: true },
    Port: { type: String, required: true },
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    Impact: { type: String, required: true },
    Solution: { type: String, required: true },
    CI: { type: String, required: true }
  },
  { timestamps: true },
);

export const InfraModel = model('Infrastructure', InfraSchema);
