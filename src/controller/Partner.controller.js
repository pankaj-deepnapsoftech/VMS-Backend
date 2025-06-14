import { StatusCodes } from "http-status-codes";
import { PartnersModel } from "../models/Partner.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";


export const CreatePartner = AsyncHandler(async (req, res) => {
  const data = req.body;
  await PartnersModel.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Partner Created Successful"
  });
});



export const GetPartner = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await PartnersModel.find({}).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const UpdatePartner = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const Partner = await PartnersModel.findById(id);
  if (!Partner) {
    throw new NotFoundError("Data Not Found", "UpdatePartner method");
  };

  await PartnersModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Partner data Updated"
  });
});


export const DeletePartner = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const Partner = await PartnersModel.findById(id);
  if (!Partner) {
    throw new NotFoundError("Data Not Found", "UpdatePartner method");
  };
  await PartnersModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Partner deleted Successful"
  });
});



export const AllPartner = AsyncHandler(async (_req, res) => {
  const data = await PartnersModel.find({}).sort({ _id: -1 }).select("company_name");
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});






