import { StatusCodes } from "http-status-codes";
import { BookDemoModal } from "../models/BookDemo.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";

export const AddBookDemo = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await BookDemoModal.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Information Submited, My team get back to you",
    data: result
  });
});



export const getBookedDemo = AsyncHandler(async (req, res) => {
  const { limit, page } = req.query;
  const limits = parseInt(limit) || 10;
  const pages = parseInt(page) || 1;
  const skip = (pages - 1) * limits;
  const data = await BookDemoModal.find({}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});

export const DeleteBookDemo = AsyncHandler(async (req,res) => {
  const {id} = req.params;
  const find = await BookDemoModal.findById(id);
  if(!find){
    throw new NotFoundError("Invalid Data","DeleteBookDemo method");
  }
  await BookDemoModal.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message:"Data Deleted Successful"
  });
});








