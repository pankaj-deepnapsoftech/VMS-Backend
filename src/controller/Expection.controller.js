import { StatusCodes } from "http-status-codes";
import { ExpectionModel } from "../models/RequestExpection.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";



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

  const data = await ExpectionModel.find({}).sort({_id:-1}).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message:"data",
    data
  });

});


export const DeleteExpection = AsyncHandler(async(req,res) => {
  const {id} = req.params;
  const find = await ExpectionModel.findById(id);
  if(!find){
    throw new NotFoundError("data not found","DeleteExpection method ()");
  }

  await ExpectionModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message:"Expection Deleted Successful"
  });
});



export const UpdateExpection = AsyncHandler(async(req,res) => {
  const {id} = req.params;
  const data = req.body;
  const find = await ExpectionModel.findById(id);
  if(!find){
    throw new NotFoundError("data not found","DeleteExpection method ()");
  }

  await ExpectionModel.findByIdAndUpdate(id,data);
  return res.status(StatusCodes.OK).json({
    message:"Expection Updated Successful"
  });
});





