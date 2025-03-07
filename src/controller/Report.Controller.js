import { StatusCodes } from 'http-status-codes';
import { config } from '../config/env.config.js';
import { ReportModel } from '../models/Report.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { NotFoundError } from '../utils/customError.js';
import fs from 'fs';

const CreateReport = AsyncHandler(async (req, res) => {
  if (!req?.file) {
    throw new NotFoundError('File is Required Field', 'Create Report method');
  }
  let file = req.file;
  const { Organization } = req.body;

  if (!Organization?.trim()) {
    fs.unlinkSync(file.path);
    throw new NotFoundError(' Select Organization', 'Create Report method');
  }

  file = config.NODE_ENV !== 'development' ? `${config.FILE_URL}/file/${file.filename}` : `${config.FILE_URL_LOCAL}/file/${file.filename}`;
    await ReportModel.create({ file, creator: req.currentUser?._id, Organization });
  return res.status(StatusCodes.CREATED).json({
    message: 'Report Upload Successful',
  });
});

const GetReport = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await ReportModel.find({}).populate([{ path: "creator", select: "full_name role" }, { path: "Organization", select:"Organization"}]).sort({ _id: -1 }).skip(skip).limit(limits);
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
  const file = req.file;
  const { Organization } = req.body;

  const find = await ReportModel.findById(id);
  if (!find) {
    throw new NotFoundError('Data Not Found', 'UpdateReport Method');
  }
  let data = null;
  if (file) {
    data = {
      file: config.NODE_ENV !== 'development' ? `${config.FILE_URL}/file/${file.filename}` : `${config.FILE_URL_LOCAL}/file/${file.filename}`,
      Organization,
    };
  } else {
    data = {
      Organization,
    };
  }

  await ReportModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: 'Report Updated Successful',
  });
});

const OrganizationReport = AsyncHandler(async (req,res) => {
    const {page,limit} = req.query;

    const pages = parseInt(page) || 1;
    const limits = parseInt(limit) || 10;
    const skip = (pages -1) * limits;

    const data = await ReportModel.find({Organization:req.currentUser?.Organization}).sort({_id:-1}).skip(skip).limit(limits);
    return res.status(StatusCodes.OK).json({
        data
    })
})

export { CreateReport, GetReport, DeleteReport, UpdateReport, OrganizationReport };
