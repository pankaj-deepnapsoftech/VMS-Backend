import { StatusCodes } from "http-status-codes";
import { InfraStructureAssetModel } from "../models/InsfrastructureAsset.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { convertExcelToJson } from "../utils/ExcelToJson.js";
import fs from 'fs';
import mongoose from "mongoose";



export const CreateInfraAsset = AsyncHandler(async (req, res) => {
  const data = req.body;
  await InfraStructureAssetModel.create({ ...data, creator: req?.currentUser?._id });
  return res.status(StatusCodes.CREATED).json({
    message: "InfraStructure Assert Added Successful"
  });
});


export const BulkCreateInfraAsset = AsyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }

  const data = convertExcelToJson(file.path);

   

  const dataWithCreator = data.map((entry) => ({
    ...entry,
    creator: req.currentUser?.tenant,
  }));

  await InfraStructureAssetModel.create(dataWithCreator);

  return res.status(StatusCodes.OK).json({
    message: "InfraStructure Assert Added Successful",
  });

});



export const GetInfraAsset = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await InfraStructureAssetModel.find({ creator: req?.currentUser?._id }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const UpdateInfraAsset = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const Role = await InfraStructureAssetModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await InfraStructureAssetModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "InfraStructure Assert update Successful"
  });
});


export const DeleteInfraAsset = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const Role = await InfraStructureAssetModel.findById(id);
  if (!Role) {
    throw new NotFoundError("data not found", "UpdateRole method");
  };
  await InfraStructureAssetModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "InfraStructure Assert Deleted Successful"
  });
});


export const GetAllInfraAsset = AsyncHandler(async (req, res) => {
  const data = await InfraStructureAssetModel.find({ creator: req?.currentUser?._id });
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});







