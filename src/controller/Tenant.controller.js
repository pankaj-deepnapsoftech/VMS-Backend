import { StatusCodes } from "http-status-codes";
import { TenantModel } from "../models/Tenant.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";



export const CreateTenant = AsyncHandler(async (req, res) => {
  const data = req.body;
  await TenantModel.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Tenant Created"
  });
});

export const GetTenant = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await TenantModel.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});

export const UpdateTenant = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const exist = await TenantModel.findById(id);
  if (!exist) {
    throw new NotFoundError("Data not found", "UpdtaeTenant method");
  }
  await TenantModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Tenant update Successful"
  });
});

export const DeleteTenant = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const tenant = await TenantModel.findById(id);
  if (!tenant) {
    throw new NotFoundError("Tenant is Already deleted", "DeleteTenant method");
  }

  await TenantModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Tenant deleted Successful"
  });

});











