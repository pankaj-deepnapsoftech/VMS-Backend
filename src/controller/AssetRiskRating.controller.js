import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { AssetRiskRatingModel } from "../models/AssertRiskRating.model.js";


export const CreateAssetRiskRating = AsyncHandler(async (req, res) => {
  const data = req.body;
  await AssetRiskRatingModel.create(data);

  return res.status(StatusCodes.CREATED).json({
    message: "Data created"
  });
});

export const GetAssetRiskRating = AsyncHandler(async (req, res) => {
  const { limit, page } = req.query;
  const limits = parseInt(limit) || 10;
  const pages = parseInt(page) || 1;
  const skip = (pages - 1) * limits;
  const data = await AssetRiskRatingModel.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});

export const DeleteAssetRiskRating = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const find = await AssetRiskRatingModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data is Already deleted", "DeleteAssertData method");
  };

  await AssetRiskRatingModel.findByIdAndDelete(id);

  return res.status(StatusCodes.OK).json({
    message:"Data deleted Successful"
  });
});

export const UpdateAssetRiskRating = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await AssetRiskRatingModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data Not Found", "UpdateAssertData");
  };
  await AssetRiskRatingModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "data updated Successful"
  });
});

