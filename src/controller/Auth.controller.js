import { StatusCodes } from "http-status-codes";
import { AuthModel } from "../models/Auth.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { BadRequestError } from "../utils/customError.js";

const RegisterUser = AsyncHandler(async (req,res)=>{
    const data = req.body ;
    
    const existUser = await AuthModel.findOne({email:data.email});
    if(existUser){
        throw new BadRequestError("User already exist","RegisterUser method")
    }

    await AuthModel.create(data)
    return res.status(StatusCodes.OK).json({
        message:"User created Successful"
    })

})


export {RegisterUser}