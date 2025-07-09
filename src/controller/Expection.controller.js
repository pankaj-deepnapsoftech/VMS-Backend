import { StatusCodes } from "http-status-codes";
import { ExpectionModel } from "../models/RequestExpection.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import mongoose from "mongoose";



export const CreateExpection = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await ExpectionModel.create({ ...data, creator: req?.currentUser?._id });
  return res.status(StatusCodes.CREATED).json({
    message: "Expection created successful",
    data: result
  });
});


export const GetExpection = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;



  const data = await ExpectionModel.aggregate([
    {
      $lookup: {
        from: "datas",
        localField: "vulnerable_data",
        foreignField: "_id",
        as: "vulnerable_data",
      }
    },
    {
      $addFields: {
        vulnerable_data: {
          $arrayElemAt: ["$vulnerable_data", 0]
        }
      }
    }, {
      $match: creator ?  {
        "vulnerable_data.creator": new mongoose.Types.ObjectId(creator) // Match inside joined data
      } : {}

    }
  ]).sort({_id:-1}).skip(skip).limit(limits);


  // const data = await ExpectionModel.find({}).populate("vulnerable_data").sort({_id:-1}).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });

});


export const DeleteExpection = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const find = await ExpectionModel.findById(id);
  if (!find) {
    throw new NotFoundError("data not found", "DeleteExpection method ()");
  }

  await ExpectionModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Expection Deleted Successful"
  });
});



export const UpdateExpection = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const find = await ExpectionModel.findById(id);
  if (!find) {
    throw new NotFoundError("data not found", "DeleteExpection method ()");
  }

  await ExpectionModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Expection Updated Successful"
  });
});





