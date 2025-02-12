import { StatusCodes } from "http-status-codes";
import { NotificationModel } from "../models/Notifictaion.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";


const CreateNotification = AsyncHandler(async (req,res)=>{
    const data = req.body;
    await NotificationModel.create(data)
    return res.status(StatusCodes.OK).json({
        Message:"Notification Send",
    })
})

const GetNotification = AsyncHandler(async(req,res)=>{
    const data = await NotificationModel.find({reciver_id:req.currentUser?._id});
    return res.status(StatusCodes.OK).json({
        data
    })
})

const NotificationViewed = AsyncHandler(async(req,res)=>{
    const {id} = req.params;

    const find = await NotificationModel.findById(id);
    if(!find){
        throw new NotFoundError("Data Not Found","NotificationViewed method")
    }
    await NotificationModel.findByIdAndUpdate(id,{view:true})
    return res.status(StatusCodes.OK).json({
        message:"notification viewed"
    })
})

export {CreateNotification,GetNotification,NotificationViewed}