import { AiPoweredModel } from "../models/AipoweScan.model.js";




export const createAiPowerData = async (data) => {
  const result = await AiPoweredModel.create(data);
  return result;
};

export const getAiPowerData = async (match,skip,limit) => {
  const result = await AiPoweredModel.find(match).sort({_id:-1}).skip(skip).limit(limit);
  return result;
};

export const updateAiPowerData = async (id,data) => {
  const result = await AiPoweredModel.findByIdAndUpdate(id,data,{new:true});
  return result;
};

export const deleteAiPowerData = async (id) => {
  const data = await AiPoweredModel.findByIdAndDelete(id);
  return data;
};










