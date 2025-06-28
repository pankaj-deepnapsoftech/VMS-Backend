import { Schema, model } from 'mongoose';

const proofConcept = new Schema({
  test: { type: String, required: true },
  description: { type: String, required: true },
});

const DataSchema = new Schema(
  {
    scan_type: { type: String, required: true },
    asset_type: { type: String, required: true },
    threat_type: { type: String, required: true },
    CVE: { type: String, required: true },
    CVE_ID: { type: String, required: true },
    Exploit_Availale: { type: String, required: true },
    Exploit_Details: { type: [String], required: true },
    EPSS: { type: String, required: true },
    exploit_complexity: { type: String, required: true },
    Location: { type: String, required: true },
    Title: { type: String, required: true },
    Description: { type: String },
    Severity: { type: String, required: true },
    CVSS: { type: String, required: true },
    Reference_URL: { type: String, required: true },
    Proof_of_Concept: proofConcept,
  },
  { timestamps: true },
);


export const DataModel = model('Data', DataSchema);
