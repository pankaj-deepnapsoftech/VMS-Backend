import { StatusCodes } from "http-status-codes";
import { EmaliingModal } from "../models/Emailing.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";


export const CreateMailing = AsyncHandler(async (req, res) => {
  const data = req.body;
  
  const result = await EmaliingModal.create(data);
  return res.status(StatusCodes.OK).json({
    message: "Mailing sheduled",
    data: result,
  });
});

export const GetMailing = AsyncHandler(async (req, res) => {
  const tenant = req.query.tenant || req.currentUser.tenant;
  const data = await EmaliingModal.find({tenant});
  res.status(StatusCodes.OK).json({
    data
  });
});

export const UpdateMailing = AsyncHandler(async (req,res) => {
  const {id} = req.params;
  const data = req.body;

  const update = await EmaliingModal.findByIdAndUpdate(id,data,{new:true});
  if(!update){
    throw new NotFoundError("data not found","UpdateMailing () method");
  }
  res.status(StatusCodes.OK).json({
    message:"data updated successfully",
    data:update
  });
});


export const DeleteMailing = AsyncHandler(async (req,res)=> {
  const {id} = req.params;
  const data = await EmaliingModal.findByIdAndDelete(id);
  if(!data){
    throw new NotFoundError("data already deleted","DeleteMailing() method");
  }
  res.status(StatusCodes.OK).json({
    message:"Data Deleted",
    data
  });
});


















