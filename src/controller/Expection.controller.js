import { StatusCodes } from "http-status-codes";
import { ExpectionModel } from "../models/RequestExpection.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";



export const CreateExpection = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await ExpectionModel.create({ ...data, creator: req?.currentUser?._id });
  return res.status(StatusCodes.CREATED).json({
    message: "Expection created successful",
    data:result
  });
});


export const GetExpection = AsyncHandler(async (req,res) => {

});





