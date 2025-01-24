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
  await DataModel.findByIdAndUpdate(id, update).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data updated Successful',
  });
});

const DataCounsts = AsyncHandler(async (_req,res) => {
  const data = await DataModel.find({}).exec();
  const totalData = data.length;
  const inProgress = data.filter((item)=>item.Status.toLocaleLowerCase().includes("open" || 'reopen')).length;
  const open = data.filter((item)=>item.Status.toLocaleLowerCase() === "open").length;
  const reopen = data.filter((item)=>item.Status.toLocaleLowerCase().includes("reopen")).length;
  const closed = data.filter((item)=>item.Status.toLocaleLowerCase().includes("closed")).length;
  const onHold = data.filter((item)=>item.Status.toLocaleLowerCase().includes("on hold")).length;
  return res.status(StatusCodes.OK).json({
    totalData,
    inProgress,
    open,
    reopen,
    closed,
    onHold
  })
})

const vulnerableItems = AsyncHandler(async (_req,res)=>{
  const data = await DataModel.aggregate([
    {
      $group:{_id:{ $month:"$createdAt"},name:{$push :"$Severity"}}
    }
  ]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const newData = data.map((item)=>({
    month:months[item._id -1],
    high: item.name.filter((ite)=>ite.toLocaleLowerCase().includes("high")).length,
    low:item.name.filter((ite)=>ite.toLocaleLowerCase().includes("low")).length,
    informational:item.name.filter((ite)=>ite.toLocaleLowerCase().includes("informational")).length,
    medium:item.name.filter((ite)=>ite.toLocaleLowerCase().includes("medium")).length,
    critical:item.name.filter((ite)=>ite.toLocaleLowerCase().includes("critical")).length,
  }))  

  return res.status(StatusCodes.OK).json({
    newData
  })
  
})

const VulnerableRiskRating = AsyncHandler(async (_req,res) => {
  const data = await DataModel.aggregate([
    {
      $group:{_id:{ $month:"$createdAt"},name:{$push :"$Severity"}}
    }
  ]);

  const Critical = data.reduce((acc, item) => {
  acc["name"] = "Critical"
  acc["0-30 Days"] += item._id === 1 ? item.name.filter(n => n.toLocaleLowerCase().includes("critical")).length : 0;
  acc["31-60 Days"] += item._id === 2 ? item.name.filter(n => n.toLocaleLowerCase().includes("critical")).length : 0;
  acc["61-90 Days"] += item._id === 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("critical")).length : 0;
  acc["90+ Days"] += item._id > 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("critical")).length : 0;
  return acc;
}, { "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 });

const High = data.reduce((acc, item) => {
  acc["name"] = "High"
acc["0-30 Days"] += item._id === 1 ? item.name.filter(n => n.toLocaleLowerCase().includes("high")).length : 0;
acc["31-60 Days"] += item._id === 2 ? item.name.filter(n => n.toLocaleLowerCase().includes("high")).length : 0;
acc["61-90 Days"] += item._id === 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("high")).length : 0;
acc["90+ Days"] += item._id > 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("high")).length : 0;
return acc;
}, { "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 });

const Medium = data.reduce((acc, item) => {
  acc["name"] = "Medium"
acc["0-30 Days"] += item._id === 1 ? item.name.filter(n => n.toLocaleLowerCase().includes("medium")).length : 0;
acc["31-60 Days"] += item._id === 2 ? item.name.filter(n => n.toLocaleLowerCase().includes("medium")).length : 0;
acc["61-90 Days"] += item._id === 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("medium")).length : 0;
acc["90+ Days"] += item._id > 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("medium")).length : 0;
return acc;
}, { "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 });

const Low = data.reduce((acc, item) => {
  acc["name"] = "Low"
acc["0-30 Days"] += item._id === 1 ? item.name.filter(n => n.toLocaleLowerCase().includes("low")).length : 0;
acc["31-60 Days"] += item._id === 2 ? item.name.filter(n => n.toLocaleLowerCase().includes("low")).length : 0;
acc["61-90 Days"] += item._id === 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("low")).length : 0;
acc["90+ Days"] += item._id > 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("low")).length : 0;
return acc;
}, { "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 });

const info = data.reduce((acc, item) => {
  acc["name"] = "info"
acc["0-30 Days"] += item._id === 1 ? item.name.filter(n => n.toLocaleLowerCase().includes("informational")).length : 0;
acc["31-60 Days"] += item._id === 2 ? item.name.filter(n => n.toLocaleLowerCase().includes("informational")).length : 0;
acc["61-90 Days"] += item._id === 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("informational")).length : 0;
acc["90+ Days"] += item._id > 3 ? item.name.filter(n => n.toLocaleLowerCase().includes("informational")).length : 0;
return acc;
}, { "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 });

  return res.status(StatusCodes.OK).json({
    Critical,
    High,
    Medium,
    Low,
    info
  })
})

export { 
  CreateData, 
  getAllData, 
  DeteleOneData, 
  updateOneData,
  DataCounsts,
  vulnerableItems,
  VulnerableRiskRating 
};
