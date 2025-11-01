import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { createAiPowerData, deleteAiPowerData, getAiPowerData, updateAiPowerData } from "../services/aiPower.service.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";



export const CreateAiPower = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await createAiPowerData({...data,user:req.currentUser._id});
  return res.status(StatusCodes.OK).json({
    message: "Ai power scan register",
    data: result
  });
});


export const GetAiPower = AsyncHandler(async (req, res) => {

  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const tenant = req.query.tenant || req.currentUser.tenant;

  const matchFilter = {
    ...(tenant ? { tenant: new mongoose.Types.ObjectId(tenant) } : {}),
  };

  const data = await getAiPowerData(matchFilter, skip, limits);
  res.status(StatusCodes.OK).json({
    data
  });
});


export const UpdateAiPower = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const update = await updateAiPowerData(id, data);
  if (!update) {
    throw new NotFoundError("data not found", "UpdateAiPower () method");
  };

  res.status(StatusCodes.OK).json({
    message: "Ai power scan updated",
    data: update
  });
});

export const DeleteAiPower = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await deleteAiPowerData(id);
  if (!data) {
    throw new NotFoundError("data is already deleted", "DeleteAiPower () methed");
  };

  res.status(StatusCodes.OK).json({
    message: "Ai power data deleted",
    data
  });

});













