import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";



export const CreateBusinessApp = AsyncHandler(async (req, res) => {
  const data = req.body;
  await ApplicationModel.create({...data,creator:req?.currentUser?._id});
  return res.status(StatusCodes.CREATED).json({
    message: "Business Application Added Successful"
  });
});



export const GetBusinessApp = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await ApplicationModel.find({creator:req?.currentUser?._id}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const UpdateBusinessApp = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const Role = await ApplicationModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await ApplicationModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Business Application update Successful"
  });
});


export const DeleteBusinessApp = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const Role = await ApplicationModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await ApplicationModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Business Application Deleted Successful"
  });
});


export const GetAllBusinessApp = AsyncHandler(async (req, res) => {
  const data = await ApplicationModel.find({creator:req?.currentUser?._id});
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});







