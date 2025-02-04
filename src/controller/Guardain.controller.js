import { StatusCodes } from "http-status-codes";
import { GuardianModel } from "../models/guardain.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";

const CreateGuard = AsyncHandler( async (req,res) => {
    const data = req.body;
    const result = GuardianModel.create(data);
    return res.status(StatusCodes.OK).json({
        message:"Guardain Data Created Successful",
        result
    })
});


const GetGuardData = AsyncHandler(async (_req,res)=>{
    const data = await GuardianModel.get({})
    return res.status(StatusCodes.OK).json({
        message:"data found",
        data
    })
})

const DeleteGuardData = AsyncHandler(async (req,res) => {
    const {id} = req.params;

    const find = await GuardianModel.findById(id);
    if(!find){
        throw new NotFoundError("Wrong credentials","DeleteGuardData Method")
    }
    await GuardianModel.findByIdAndDelete(id);
    return res.status(StatusCodes.OK).json({
        message:"Data deleted successful"
    })

})

export {
    CreateGuard,
    GetGuardData,
    DeleteGuardData
}