import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
// import moment from 'moment';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { DataModel } from '../models/Data.model.js';
import { NotFoundError } from '../utils/customError.js';
import { convertKeysToUnderscore } from '../utils/excelSerialToDate.js';
import { getExploitability } from './OpenApi.controller.js';
import mongoose from 'mongoose';
import { EPSS, ExploitDetails, getCveId } from '../utils/ThirdPartHandler.js';
import { ExpectionModel } from '../models/RequestExpection.model.js';
import { InfraStructureAssetModel } from '../models/InsfrastructureAsset.model.js';
import { ApplicationModel } from '../models/BusinessApplications.model.js';


export const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



const CreateData = AsyncHandler(async (req, res) => {
  const id = req.currentUser?.tenant;
  const file = req.file;
  if (!file) {
    throw new NotFoundError('File is reqired', 'CreateData method');
  }
  const data = convertExcelToJson(file.path);
  const newData = await Promise.all(data.map(async (item) => {
    const exploitability = await getExploitability(item.Title, item.Severity);
    return { ...item, exploitability };
  }));


  const newdata = newData.map((item) => convertKeysToUnderscore(id ? { ...item, creator_id: id } : item));
  const result = await DataModel.create(newdata);

  fs.unlinkSync(file.path);

  return res.status(StatusCodes.OK).json({
    message: 'Data created Successful',
    result,
  });
});

const AddNewData = AsyncHandler(async (req, res) => {
  const data = req.body;

  const creator = req?.currentUser?.tenant || req.query?.tenant;

  let Exploit_Availale = "", Exploit_Details = "", EPSSData = "";

  if (data?.CVE_ID) {
    Exploit_Availale = await getCveId(data?.CVE_ID);
    if (Exploit_Availale) {
      Exploit_Details = await ExploitDetails(data?.CVE_ID);
    }
    EPSSData = await EPSS(data?.CVE_ID);
  }


  await DataModel.create({ ...data, creator, EPSS: EPSSData, Exploit_Details, Exploit_Availale });

  return res.status(StatusCodes.OK).json({
    message: 'data created',
    data
  });
});

const getApplicationData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;

  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), asset_type: "Application" } : { asset_type: "Application" }
    },
    {
      $lookup: {
        from: "expections",
        foreignField: "vulnerable_data",
        localField: "_id",
        as: "Expection"
      }
    },
    {
      $lookup: {
        from: "businessapplications",
        localField: "BusinessApplication",
        foreignField: "_id",
        as: "BusinessApplication"
      }
    },
    {
      $lookup: {
        from: "tenants",
        localField: "creator",
        foreignField: "_id",
        as: "creator"
      }
    },

    {
      $addFields: {
        BusinessApplication: { $arrayElemAt: ["$BusinessApplication", 0] },
        creator: { $arrayElemAt: ["$creator", 0] },
        Expection: { $arrayElemAt: ["$Expection", 0] },
      }
    }
  ]).skip(skip)
    .limit(limits)
    .exec();

  return res.status(StatusCodes.OK).json({
    message: 'Data Found',
    data,
  });
});

const getInfrastructureData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;


  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), asset_type: "Infrastructure" } : { asset_type: "Infrastructure" }
    },
    {
      $lookup: {
        from: "expections",
        foreignField: "vulnerable_data",
        localField: "_id",
        as: "Expection"
      }
    },
    {
      $lookup: {
        from: "infrastructureassets",
        localField: "InfraStructureAsset",
        foreignField: "_id",
        as: "InfraStructureAsset",
        pipeline: [
          {
            $lookup: {
              from: "tags",
              localField: "data_sensitivity",
              foreignField: "_id",
              as: "data_sensitivity",
            }
          },
          {
            $lookup: {
              from: "tags",
              localField: "service_role",
              foreignField: "_id",
              as: "service_role",
            }
          },
          {
            $addFields: {
              service_role_score_total: {
                $sum: "$service_role.tag_score"
              },
              data_sensitivity: { $arrayElemAt: ["$data_sensitivity.tag_score", 0] }
            }
          },
          {
            $project: {
              asset_class: 1,
              exposure: 1,
              hosting: 1,
              service_role_score_total: 1,
              data_sensitivity: 1,
              asset_hostname: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "tenants",
        localField: "creator",
        foreignField: "_id",
        as: "creator"
      }
    },

    {
      $addFields: {
        InfraStructureAsset: { $arrayElemAt: ["$InfraStructureAsset", 0] },
        creator: { $arrayElemAt: ["$creator", 0] },
        Expection: { $arrayElemAt: ["$Expection", 0] },
      }
    }
  ]).skip(skip)
    .limit(limits)
    .exec();



  return res.status(StatusCodes.OK).json({
    message: 'Data Found',
    data,
  });
});

const getAllVulnerabilityData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const Pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (Pages - 1) * limits;
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), } : {}
    },
    {
      $lookup: {
        from: "businessapplications",
        localField: "BusinessApplication",
        foreignField: "_id",
        as: "BusinessApplication",
        pipeline: [
          {
            $lookup: {
              from: "infrastructureassets",
              localField: "asset",
              foreignField: "_id",
              as: "asset",
              pipeline: [
                {
                  $lookup: {
                    from: "tags",
                    localField: "service_role",
                    foreignField: "_id",
                    as: "service_role",
                  }
                },
                {
                  $lookup: {
                    from: "tags",
                    localField: "data_sensitivity",
                    foreignField: "_id",
                    as: "data_sensitivity",
                  }
                },
                {
                  $addFields: {
                    service_role_score_total: { $sum: "$service_role.tag_score" },
                    data_sensitivity: { $arrayElemAt: ["$data_sensitivity.tag_score", 0] },
                    amount: { $arrayElemAt: ["$data_sensitivity.amount", 0] }

                  }
                }
              ]
            }
          },
          {
            $addFields: {
              asset_hostname: { $arrayElemAt: ["$asset.asset_hostname", 0] },
              asset_class: { $arrayElemAt: ["$asset.asset_class", 0] },
              exposure: { $arrayElemAt: ["$asset.exposure", 0] },
              hosting: { $arrayElemAt: ["$asset.hosting", 0] },
              data_sensitivity: { $arrayElemAt: ["$asset.data_sensitivity", 0] },
              service_role_score_total: { $arrayElemAt: ["$asset.service_role_score_total", 0] },
              amount: { $arrayElemAt: ["$asset.amount", 0] },
            }
          },
          {
            $project: {
              name: 1,
              asset_hostname: 1,
              asset_class: 1,
              exposure: 1,
              hosting: 1,
              data_sensitivity: 1,
              service_role_score_total: 1,
              amount: 1
            }
          }

        ]
      }
    },
    {
      $lookup: {
        from: "infrastructureassets",
        localField: "InfraStructureAsset",
        foreignField: "_id",
        as: "InfraStructureAsset",
        pipeline: [
          {
            $lookup: {
              from: "tags",
              localField: "service_role",
              foreignField: "_id",
              as: "service_role",
            }
          },
          {
            $lookup: {
              from: "tags",
              localField: "data_sensitivity",
              foreignField: "_id",
              as: "data_sensitivity",
            }
          },
          {
            $addFields: {
              service_role_score_total: { $sum: "$service_role.tag_score" },
              data_sensitivity: { $arrayElemAt: ["$data_sensitivity.tag_score", 0] },
              amount: { $arrayElemAt: ["$data_sensitivity.amount", 0] }
            }
          },
          {
            $project: {
              asset_hostname: 1,
              asset_class: 1,
              exposure: 1,
              hosting: 1,
              data_sensitivity: 1,
              service_role_score_total: 1,
              amount: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        BusinessApplication: { $arrayElemAt: ["$BusinessApplication", 0] },
        InfraStructureAsset: { $arrayElemAt: ["$InfraStructureAsset", 0] },
      }
    },
    {
      $project: {
        Title: 1,
        EPSS: 1,
        exploit_complexity: 1,
        Exploit_Availale: 1,
        threat_type: 1,
        InfraStructureAsset: 1,
        BusinessApplication: 1
      }
    }
  ]).sort({ _id: -1 }).skip(skip).limit(limits);

  return res.status(StatusCodes.OK).json({
    data
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

const DeleteManyData = AsyncHandler(async (req, res) => {
  const { ids } = req.body;
  const find = await DataModel.find({ _id: { $in: ids } });
  if (!find) {
    throw new NotFoundError("data not found", "DeleteManyData method()");
  }
  await DataModel.deleteMany({ _id: { $in: ids } });
  return res.status(200).json({
    message: "Data deleted"
  });
});

const updateOneData = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  let update = req.body;



  const data = await DataModel.findById(id).exec();
  if (!data) {
    throw new NotFoundError('data not Found', 'DeleteOneData method');
  }

  let Exploit_Availale = false, Exploit_Details = "", EPSSData = "";

  if (update?.CVE_ID) {
    Exploit_Availale = await getCveId(update?.CVE_ID);
    if (Exploit_Availale) {
      Exploit_Details = await ExploitDetails(update?.CVE_ID);
    }
    EPSSData = await EPSS(update?.CVE_ID);
  }

  await DataModel.findByIdAndUpdate(id, { ...update, Exploit_Availale, Exploit_Details, EPSS: EPSSData }).exec();
  return res.status(StatusCodes.OK).json({
    message: 'data updated Successful',
  });
});

const GetTVMCardData = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const matchFilter = creator ? { creator } : {};

  const [
    vulnerableData,
    expections,
    infrastructure,
    businessApplication
  ] = await Promise.all([
    DataModel.find(matchFilter), // get all vulnerable data
    ExpectionModel.aggregate([
      {
        $lookup: {
          from: "datas",
          localField: "vulnerable_data",
          foreignField: "_id",
          as: "vulnerable_data",
        }
      },
      { $unwind: "$vulnerable_data" }
    ]),
    InfraStructureAssetModel.countDocuments(matchFilter),
    ApplicationModel.countDocuments(matchFilter)
  ]);

  const remediatedCount = vulnerableData.filter(item => item.status === 'Closed').length;
  const expectionsCount = creator
    ? expections.filter(item => item.vulnerable_data.creator == creator).length
    : expections.length;

  return res.status(StatusCodes.OK).json({
    vulnerableData: vulnerableData.length,
    expections: expectionsCount,
    infrastructure,
    businessApplication,
    Remediated: remediatedCount,
  });
});

const TVMFirstChart = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.find(creator ? { creator } : {});

  let Open = 0, Closed = 0, Re_Open = 0, False_Positive = 0;
  data.map((item) => {
    if (item.status === "Open") Open++;
    if (item.status === "Closed") Closed++;
    if (item.status === "Re-Open") Re_Open++;
    if (item.status === "False Positive") False_Positive++;

  });

  return res.status(StatusCodes.OK).json({
    Open,
    Closed,
    Re_Open,
    False_Positive,
    total: data.length
  });
});



const TVMSecondChart = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const matchFilter = creator ? { creator: new mongoose.Types.ObjectId(creator) } : {};

  const result = await DataModel.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          severity: "$Severity"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { year: "$_id.year", month: "$_id.month" },
        severities: {
          $push: {
            severity: "$_id.severity",
            count: "$count"
          }
        }
      }
    },
    {
      $addFields: {
        monthName: {
          $dateToString: {
            format: "%b",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            }
          }
        }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  const formatted = result.map((item) => {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0
    };
    item.severities.forEach(s => {
      counts[s.severity] = s.count;
    });

    return {
      month: `${item.monthName}`, // e.g., "Jan 2025"
      ...counts
    };
  });

  let label = [], Critical = [], High = [], Medium = [], Low = [], Informational = [];

  formatted.map((item) => {
    label.push(item.month);
    Critical.push(item.Critical);
    High.push(item.High);
    Medium.push(item.Medium);
    Low.push(item.Low);
    Informational.push(item.Informational);
  });

  return res.status(StatusCodes.OK).json({
    label,
    Critical,
    High,
    Medium,
    Low,
    Informational
  });
});

const TVMSexthChart = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.find(creator ? { creator } : {});

  const newData = {};
  data.map((item) => {

  });

});




export {
  CreateData,
  getApplicationData,
  DeleteManyData,
  DeteleOneData,
  updateOneData,
  AddNewData,
  getInfrastructureData,
  getAllVulnerabilityData,
  GetTVMCardData,
  TVMFirstChart,
  TVMSecondChart,
  TVMSexthChart
};
