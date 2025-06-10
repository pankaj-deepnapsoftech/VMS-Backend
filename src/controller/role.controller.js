import { StatusCodes } from "http-status-codes";
import { RoleModels } from "../models/Role.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";

export const CreateRole = AsyncHandler(async (req, res) => {
  const data = req.body;
  await RoleModels.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Role Added Successful"
  });
});



export const GetRole = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await RoleModels.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const UpdateRole = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const Role = await RoleModels.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await RoleModels.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Role update Successful"
  });
});


export const DeleteRole = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const Role = await RoleModels.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await RoleModels.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Role Deleted Successful"
  });
});


export const GetAllRols = AsyncHandler(async (_req, res) => {
  const data = await RoleModels.find({}).select("role");
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});






