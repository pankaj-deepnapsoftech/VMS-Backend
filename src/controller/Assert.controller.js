import fs from "fs";
import { StatusCodes } from "http-status-codes";

import { AssertModel } from "../models/AssetInventory.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { convertKeysToUnderscore } from "../utils/excelSerialToDate.js";
import { convertExcelToJson } from "../utils/ExcelToJson.js";


export const CreateAssert = AsyncHandler(async (req,res)=>{
  const id = req.currentUser?._id;
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }
  const data = convertExcelToJson(file.path);

  const newdata = data.map((item) => convertKeysToUnderscore({ ...item, creator_id: id }));
  await AssertModel.create(newdata);
  fs.unlinkSync(file.path);
  return res.status(StatusCodes.OK).json({
    message: 'Data created Successful'
  });
});


export const CreateSingleAssert = AsyncHandler(async (req,res) => {
  const data = req.body;
  await AssertModel.create(data);

  return res.status(StatusCodes.CREATED).json({
    message:"Data created"
  });
});

export const GetAssertData = AsyncHandler(async (req,res) => {
  const {limit,page} = req.query;
  const limits = parseInt(limit) || 10;
  const pages = parseInt(page) || 1;
  const skip = (pages -1) * limits;
  const data = await AssertModel.find({}).sort({_id:-1}).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message:"data",
    data
  });
});




