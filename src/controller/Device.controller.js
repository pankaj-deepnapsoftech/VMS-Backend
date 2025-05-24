import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { DeviceModel } from "../models/Device.model.js";
import { NotFoundError } from "../utils/customError.js";


export const CreateDevice = AsyncHandler(async (req, res) => {
  const data = req.body;
  await DeviceModel.create(data);

  return res.status(StatusCodes.CREATED).json({
    message: "Data created"
  });
});

export const GetDeviceData = AsyncHandler(async (req, res) => {
  const { limit, page } = req.query;
  const limits = parseInt(limit) || 10;
  const pages = parseInt(page) || 1;
  const skip = (pages - 1) * limits;
  const data = await DeviceModel.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});

export const DeleteDeviceData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const find = await DeviceModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data is Already deleted", "DeleteAssertData method");
  };

  await DeviceModel.findByIdAndDelete(id);

  return res.status(StatusCodes.OK).json({
    message:"Data deleted Successful"
  });
});

export const UpdateDeviceData = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await DeviceModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data Not Found", "UpdateAssertData");
  };
  await DeviceModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "data updated Successful"
  });
});

