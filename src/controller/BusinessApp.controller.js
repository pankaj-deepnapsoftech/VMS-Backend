import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";
import { convertExcelToJson } from "../utils/ExcelToJson.js";
import fs from 'fs';
import { InfraStructureAssetModel } from "../models/InsfrastructureAsset.model.js";



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
  const data = await ApplicationModel.find(creator ? { creator } : {}).populate([{ path: "asset" }]).sort({ _id: -1 }).skip(skip).limit(limits);
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
  const data = await ApplicationModel.find(creator ? { creator } : {}).sort({ _id: -1 }).select("name");
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });
});


export const TVMChartForth = AsyncHandler(async (req, res) => {

  let { year } = req.query;
  const creator = req?.currentUser?.tenant || req.query?.tenant;

  year = parseInt(year) || new Date().getFullYear();

  const businessApplication = await ApplicationModel.find(creator ? {
    creator,
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  } : {
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  }).countDocuments();
  const infrastructureIP = await InfraStructureAssetModel.find(creator ? {
    creator,
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  } : {
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  }).countDocuments();

  return res.status(StatusCodes.OK).json({
    businessApplication,
    infrastructureIP
  });

});





