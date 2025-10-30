import { StatusCodes } from 'http-status-codes';
import { config } from '../config/env.config.js';
import { ReportModel } from '../models/Report.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/customError.js';
import { VulnerabilityReport } from '../models/nessus.model.js';
import { DataModel } from '../models/Data.model.js';
import { GetAllVulnerabilityData } from '../services/data.service.js';

export const CreateReport = AsyncHandler(async (req, res) => {
  const data = req.body;

  const result = await ReportModel.create(data);
  res.status(StatusCodes.OK).json({
    data: result
  });
});

export const GetReport = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const creator = req.query.tenant || req.currentUser?.tenant;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await ReportModel.find(creator ? { creator } : {})
    .populate([
      { path: 'creator', },
      { path: 'Type_Of_Assesment' },
    ])
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limits);
  return res.status(StatusCodes.OK).json({
    data,
  });
});

export const DeleteReport = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const find = await ReportModel.findById(id);
  if (!find) {
    throw new NotFoundError('Wrong Id', 'DeleteReport Method');
  }

  await ReportModel.findByIdAndDelete(id);

  return res.status(StatusCodes.OK).json({
    message: 'Report Deleted Successful',
  });
});

export const UpdateReport = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;


  const find = await ReportModel.findById(id);
  if (!find) {
    throw new NotFoundError('Data Not Found', 'UpdateReport Method');
  }

  await ReportModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: 'Report Updated Successful',
  });
});




export const AllVulnerablity = AsyncHandler(async (req, res) => {
  const currentYear = parseInt(req.query?.year) || new Date().getFullYear();


  // Get the start and end dates for the current year
  const startOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
  const endOfYear = new Date(currentYear + 1, 0, 1); // January 1st of the next year (exclusive)

  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const matchFilter = creator ? { creator } : {};

  // Add createdAt range filter for the current year
  const finalFilter = {
    ...matchFilter,
    createdAt: { $gte: startOfYear, $lt: endOfYear } // Filter by createdAt between start and end of the year
  };

  const data = await GetAllVulnerabilityData(finalFilter);

  res.status(StatusCodes.OK).json({
    data
  });
});



