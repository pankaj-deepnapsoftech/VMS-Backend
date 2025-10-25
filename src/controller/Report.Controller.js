import { StatusCodes } from 'http-status-codes';
import { config } from '../config/env.config.js';
import { ReportModel } from '../models/Report.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/customError.js';

export const CreateReport = AsyncHandler(async (req, res) => {
  const data = req.body;

  const result = await ReportModel.create(data);
  res.status(StatusCodes.OK).json({
    data:result
  });
});

const GetReport = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const creator = req.query.tenant || req.currentUser?.tenant;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await ReportModel.find(creator ? {creator} : {})
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

const DeleteReport = AsyncHandler(async (req, res) => {
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

const UpdateReport = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  const find = await ReportModel.findById(id);
  if (!find) {
    throw new NotFoundError('Data Not Found', 'UpdateReport Method');
  }
  
  await ReportModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: 'Report Updated Successful',
  });
});

const OrganizationReport = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  let Organization;
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?._id;
  } else if (!req?.currentUser?.Organization) {
    Organization = req?.currentUser?.owner;
  }

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await ReportModel.find({Organization}).populate({ path: 'creator', select: 'full_name role' }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const AssessorReport = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await ReportModel.find({ creator: req.currentUser?._id }).populate({ path: 'Organization', select: 'Organization' }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    data,
  });
});

export { GetReport, DeleteReport, UpdateReport, OrganizationReport, AssessorReport };
