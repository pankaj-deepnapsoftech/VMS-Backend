import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { DataModel } from '../models/Data.model.js';
import { NotFoundError } from '../utils/customError.js';

function convertKeysToUnderscore(obj) {
  const newObj = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/\s+/g, '_');
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}

const CreateData = AsyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }
  const data = convertExcelToJson(file.path);
  const newdata = data.map((item) => convertKeysToUnderscore(item));
  const result = await DataModel.create(newdata);

  fs.unlinkSync(file.path);

  return res.status(StatusCodes.OK).json({
    message: 'Data created Successful',
    result,
  });
});

const getAllData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const getAllData = await DataModel.find({}).skip(skip).limit(limits).exec();
  return res.status(StatusCodes.OK).json({
    message: 'Data Found',
    data: getAllData,
  });
});

const getOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await DataModel.findById(id).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data Found',
    data,
  });
});

const DeteleOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await DataModel.findById(id).exec();
  if (!data) {
    throw new NotFoundError('data not Found', 'DeleteOneData method');
  }
  await DataModel.findByIdAndDelete(id).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data deleted Successful',
  });
});

const updateOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const data = await DataModel.findById(id).exec();
  if (!data) {
    throw new NotFoundError('data not Found', 'DeleteOneData method');
  }
  await DataModel.findByIdAndUpdate(id,update).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data updated Successful',
  });
});

export { CreateData, getAllData, getOneData,DeteleOneData,updateOneData };
