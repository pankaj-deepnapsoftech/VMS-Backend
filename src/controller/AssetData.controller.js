import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { AssertDataModel } from "../models/AssetData.model.js";


export const CreateAssertData = AsyncHandler(async (req, res) => {
  const data = req.body;
  await AssertDataModel.create(data);

  return res.status(StatusCodes.CREATED).json({
    message: "Data created"
  });
});

export const GetAssertData = AsyncHandler(async (req, res) => {
  const { limit, page } = req.query;
  const limits = parseInt(limit) || 10;
  const pages = parseInt(page) || 1;
  const skip = (pages - 1) * limits;
  const data = await AssertDataModel.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});

export const DeleteAssertData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const find = await AssertDataModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data is Already deleted", "DeleteAssertData method");
  };

  await AssertDataModel.findByIdAndDelete(id);

  return res.status(StatusCodes.OK).json({
    message:"Data deleted Successful"
  });
});

export const UpdateAssertData = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await AssertDataModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data Not Found", "UpdateAssertData");
  };
  await AssertDataModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "data updated Successful"
  });
});

