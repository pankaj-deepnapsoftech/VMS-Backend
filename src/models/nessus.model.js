import { Schema, model } from "mongoose";

const vulnerabilityReportSchema = new Schema({
  host_name: {
    type: String,
  },
  host_ip: {
    type: String,
  },
  fqdn: {
    type: String,
  },
  operating_system: {
    type: String,
  },
  plugin_id: {
    type: Number,
  },
  plugin_name: {
    type: String,
  },
  plugin_family: {
    type: String,
  },
  severity: {
    type: String,
  },
  protocol: {
    type: String,
  },
  port: {
    type: Number,
  },
  svc_name: {
    type: String,
  },
  risk_factor: {
    type: String,
  },
  cvss_base_score: {
    type: Number,
    default: null
  },
  cvss3_base_score: {
    type: Number,
    default: null
  },
  cve: {
    type: String,
    default: null
  },
  bid: {
    type: String,
    default: null
  },
  xref: {
    type: String,
    default: null
  },
  see_also: {
    type: String,
    default: null
  },
  description: {
    type: String,
  },
  synopsis: {
    type: String,
  },
  solution: {
    type: String,
  },
  plugin_output: {
    type: String,
  },
  exploit_available: {
    type: String
  },
  exploitability_ease: {
    type: String,
  },
  stig_severity: {
    type: String,
  },
  asset_inventory: {
    type: String,
  }
});

export const VulnerabilityReport = model('VulnerabilityReport', vulnerabilityReportSchema);

