import { StatusCodes } from "http-status-codes";
import { DataModel } from "../models/Data.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


const OrgnizationData = AsyncHandler(async (req,res) => {
    const {page,limit} = req.query;

    const pages = parseInt(page) || 1;
    const limits = parseInt(limit) || 10;
    const skip = (pages -1) * limits;


    const find = await DataModel.find({ Organization: req.currentUser?.Organization}).sort({id:-1}).skip(skip).limit(limits)
    return res.status(StatusCodes.ACCEPTED).json({
        data:find
    })
});


export {OrgnizationData}