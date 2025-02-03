import { StatusCodes } from "http-status-codes";
import { DataModel } from "../models/Data.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


const GetEmployeeTasksData = AsyncHandler(async (req,res) => {
    const id = req.currentUser?._id;
    const find = await DataModel.find({Assigned_To:id});

    return res.status(StatusCodes.OK).json({
        message:"tasks",
        data:find
    });

})

export {
    GetEmployeeTasksData
}