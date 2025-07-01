import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";
import { convertExcelToJson } from "../utils/ExcelToJson.js";
import fs from 'fs';



export const CreateBusinessApp = AsyncHandler(async (req, res) => {
  const data = req.body;
  await ApplicationModel.create(data);
  return res.status(StatusCodes.CREATED).json({
    message: "Business Application Added Successful"
  });
});


export const BulkCreateBusinessApp = AsyncHandler(async (req, res) => {
  const file = req.file;
  const { creator } = req.body;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }

  const data = convertExcelToJson(file.path);

  const dataWithCreator = data.map((entry) => ({
    ...entry,
    creator
  }));

  await ApplicationModel.create(dataWithCreator);

  fs.unlinkSync(file.path); 

  return res.status(StatusCodes.OK).json({
    message: "InfraStructure Assert Added Successful",
  });

});



export const GetBusinessApp = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await ApplicationModel.find(creator ? {creator} : {}).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const UpdateBusinessApp = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const Role = await ApplicationModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await ApplicationModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Business Application update Successful"
  });
});


export const DeleteBusinessApp = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const Role = await ApplicationModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await ApplicationModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Business Application Deleted Successful"
  });
});


export const GetAllBusinessApp = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await ApplicationModel.find(creator ? {creator}: {}).sort({ _id: -1 }).select("name");
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});







