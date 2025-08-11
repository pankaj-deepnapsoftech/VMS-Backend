import { SeverityModel } from "../models/Severity.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

export const CreateSeverity = AsyncHandler(async (req, res) => {
  const data = req.body;
  const severity = await SeverityModel.create(data);
  res.status(201).json({
    message: "Severity created successfully",
    data: severity
  });
});


export const GetSeverities = AsyncHandler(async (req, res) => {
  const tenant = req?.currentUser?.tenant || req.query?.tenant;
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const severities = await SeverityModel.find(tenant ? { tenant } : {}).sort({ createdAt: -1 }).skip(skip).limit(limits);
  return res.status(200).json({
    data: severities
  });
});

export const UpdateSeverity = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const severity = await SeverityModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!severity) {
    return res.status(404).json({ success: false, message: "Severity not found" });
  }
  res.status(200).json({
    data: severity
  });
});

export const DeleteSeverity = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const severity = await SeverityModel.findByIdAndDelete(id);
  if (!severity) {
    return res.status(404).json({ success: false, message: "Severity not found" });
  }
  res.status(200).json({
    message: "Severity deleted successfully"
  });
});