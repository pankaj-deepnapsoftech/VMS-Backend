import { Schema, model } from 'mongoose';

const proofConcept = new Schema({
  test: { type: String, },
  image: { type: String},
});





const DataSchema = new Schema({
  scan_type: { type: String, required: true, enum: ["Automatic", "Manual"] },
  asset_type: { type: String, required: true, enum: ['Infrastructure', "Application"] },
  threat_type: { type: String, required: true, enum: ["Vulnerability", "Misconfiguration"] },
  CVE: { type: String, required: true, enum: ["Yes", "No"] },
  CVE_ID: { type: String },
  Exploit_Availale: { type: Boolean,required:true,default:false},
  Exploit_Details: { type: [String]},
  EPSS: { type: Number },
  exploit_complexity: { type: String, enum: ["Without Authentication", "Low Privilege Require", "Full Privilege Required"] },
  status:{type:String,required:true,enum:["Open","Closed","Re-Open","False Positive","Exception"],default:"Open"},
  Location: { type: String, required: true },
  Title: { type: String, required: true },
  Description: { type: String },
  Severity: { type: Schema.Types.ObjectId,ref:"Severity", required: true },
  CVSS: { type: Number, required: true },
  Reference_URL: { type: String, required: true },
  BusinessApplication: { type: Schema.Types.ObjectId, ref: "BusinessApplication",  },
  InfraStructureAsset: { type: Schema.Types.ObjectId, ref: "InfraStructureAsset", },
  Proof_of_Concept:[proofConcept],
  creator: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  assign:{type:Schema.Types.ObjectId,ref:"User"},
  comment:{type:String},
  SLA:{type:String,enum:["MET","NOT MET"],default:null},
},
{ timestamps: true },
);


export const DataModel = model('Data', DataSchema);
