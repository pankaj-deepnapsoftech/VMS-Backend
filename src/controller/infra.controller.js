import { StatusCodes } from "http-status-codes";
import { InfraModel } from "../models/infra.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { convertExcelToJson } from "../utils/ExcelToJson.js";
import fs from "fs";

const CreateInfra = AsyncHandler(async (req,res)=>{
    const {path} = req.file;
    const data = convertExcelToJson(path);
   
    await InfraModel.create(data);
    fs.unlinkSync(path)
    return res.status(StatusCodes.CREATED).json({
        message:"Data Uploades Successful"
    })
});

const Graph1CIClasses = AsyncHandler(async(req,res) => {
    const data =await InfraModel.find({});

    let newData = {};

    data.map((item)=>{
        if(!newData[item.CI]){
            newData[item.CI] = 1
        }else{
            newData[item.CI] += 1
        }
    })

    return res.status(StatusCodes.OK).json({
        data:newData
    })

})

const Graph2CIClasses = AsyncHandler(async (req, res) => {
    const data = await InfraModel.find({});
    const NewData = {};

    data.forEach((item) => {

        if (item.CI && item.Severity) {
            if (!NewData[item.CI]) {
                NewData[item.CI] = {}; 
            }

            if (!NewData[item.CI][item.Severity]) {
                NewData[item.CI][item.Severity] = 1;
            } else {
                NewData[item.CI][item.Severity] += 1;
            }
        }
    });


    res.status(200).json({ data: NewData });
});



export { CreateInfra, Graph1CIClasses, Graph2CIClasses }