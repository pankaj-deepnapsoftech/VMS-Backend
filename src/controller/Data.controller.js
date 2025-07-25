import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
// local imports
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { DataModel } from '../models/Data.model.js';
import { NotFoundError } from '../utils/customError.js';
import { convertKeysToUnderscore, excelSerialToDate } from '../utils/excelSerialToDate.js';
import { config } from '../config/env.config.js';
import { InfraModel } from '../models/infra.model.js';
import { getExploitability } from './OpenApi.controller.js';
import { AuthModel } from '../models/Auth.model.js';
import mongoose from 'mongoose';
import { EPSS, ExploitDetails, getCveId } from '../utils/ThirdPartHandler.js';


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
              data_sensitivity: 1
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
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), } : { }
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
              amount:1
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
  ]);

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

  let Exploit_Availale = "", Exploit_Details = "", EPSSData = "";

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

const DataCounsts = AsyncHandler(async (req, res) => {
  let creator_id = req.query?.creator_id || req?.currentUser?.tenant;

  const data = await DataModel.find(
    creator_id
      ? { creator_id }
      : {}
  ).exec();


  const Infrastructure = (await InfraModel.find(req?.currentUser?.role === "Admin" ? {} : { Severity: '0' })).length;

  const counts = data.reduce(
    (acc, item) => {
      const status = item.Status?.toLocaleLowerCase();

      if (status?.includes('in progress')) acc.inProgress++;
      if (status === 'open') acc.open++;
      if (status?.includes('reopen')) acc.reopen++;
      if (status?.includes('closed')) acc.closed++;
      if (status?.includes('on hold')) acc.onHold++;
      if (status?.includes('exception')) acc.Exceptions++;
      if (item.Scan_Type?.includes('Web Application')) acc.Application++;

      acc.totalData++;
      return acc;
    },
    {
      totalData: 0,
      inProgress: 0,
      open: 0,
      reopen: 0,
      closed: 0,
      onHold: 0,
      Exceptions: 0,
      Application: 0,
    },
  );

  return res.status(StatusCodes.OK).json({ ...counts, Infrastructure });
});

const vulnerableItems = AsyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based index
  const currentYear = now.getFullYear();

  // Calculate the start of the 2 months ago
  const startMonth = currentMonth - 2;
  const startYear = startMonth < 0 ? currentYear - 1 : currentYear; // Adjust year if month is negative
  const startDate = new Date(startYear, startMonth < 0 ? 12 + startMonth : startMonth, 1); // Beginning of month 2 months ago

  // Calculate the start of the next month
  const endDate = new Date(currentYear, currentMonth + 1, 1); // Beginning of next month

  let queryData = req.query.creator_id;
  let creator_id = req.currentUser?.tenant;

   
  creator_id = queryData ? { creator_id: new mongoose.Types.ObjectId(queryData) } : creator_id ? { creator_id } : "";


  try {
    const data = await DataModel.aggregate([
      {
        $match: {
          ...creator_id,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          Severity: 1,
        },
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          name: { $push: '$Severity' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const newData = data.map((item) => ({
      month: months[item._id.month - 1], // Adjust month index for 0-based array
      year: item._id.year,
      high: item.name.filter((severity) => severity?.toLocaleLowerCase().includes('high')).length,
      low: item.name.filter((severity) => severity?.toLocaleLowerCase().includes('low')).length,
      informational: item.name.filter((severity) => severity?.toLocaleLowerCase().includes('informational')).length,
      medium: item.name.filter((severity) => severity?.toLocaleLowerCase().includes('medium')).length,
      critical: item.name.filter((severity) => severity?.toLocaleLowerCase().includes('critical')).length,
    }));

    return res.status(StatusCodes.OK).json({
      newData,
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while fetching vulnerable items.",
    });
  }
});

const VulnerableRiskRating = AsyncHandler(async (req, res) => {
  const currentDate = new Date();
  const past90Days = new Date();
  past90Days.setDate(currentDate.getDate() - 90); // 90 days ago

  // Dynamic match condition for organization filter
  const querydata = req.query?.creator_id;
  const tenant = req.currentUser?.tenant;

  const creator_id = querydata ? { creator_id: new mongoose.Types.ObjectId(querydata) } : tenant ? { creator_id: tenant } : "";

  const data = await DataModel.aggregate([
    {
      $match: {
        ...creator_id,
        createdAt: { $gte: past90Days, $lte: currentDate }, // Last 90 days data
      },
    },
    {
      $project: {
        monthDiff: {
          $divide: [{ $subtract: [currentDate, "$createdAt"] }, 1000 * 60 * 60 * 24], // Convert ms to days
        },
        Severity: 1,
      },
    },
    {
      $group: {
        _id: null,
        severities: { $push: { Severity: "$Severity", daysOld: "$monthDiff" } },
      },
    },
  ]);

  if (!data.length) {
    return res.status(StatusCodes.OK).json({});
  }

  const severityLevels = ["Critical", "High", "Medium", "Low", "Informational"];

  // Function to categorize severities by age range
  const categorizeSeverities = (severity) => {
    return data[0].severities.reduce(
      (acc, item) => {
        if (item.Severity?.toLowerCase() === severity.toLowerCase()) {
          if (item.daysOld <= 30) acc["0-30 Days"]++;
          else if (item.daysOld <= 60) acc["31-60 Days"]++;
          else if (item.daysOld <= 90) acc["61-90 Days"]++;
          else acc["90+ Days"]++;
        }
        return acc;
      },
      { name: severity, "0-30 Days": 0, "31-60 Days": 0, "61-90 Days": 0, "90+ Days": 0 }
    );
  };

  // Generate response dynamically for all severity levels
  const response = severityLevels.reduce((acc, level) => {
    acc[level] = categorizeSeverities(level);
    return acc;
  }, {});

  return res.status(StatusCodes.OK).json(response);
});

const NewAndCloseVulnerable = AsyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();

  const querydata = req.query?.creator_id;
  const tenant = req.currentUser?.tenant;

  const creator_id = querydata ? { creator_id: new mongoose.Types.ObjectId(querydata) } : tenant ? { creator_id: tenant } : "";

  const data = await DataModel.aggregate([
    {
      $match: {
        ...creator_id,
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        name: { $push: '$Status' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const newData = data.map((item) => ({
    month: months[item._id - 1],
    Open: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('open')).length,
    Closed: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('closed')).length,
    Exception: item.name.filter((ite) => ite?.toLocaleLowerCase().includes('exception')).length,
  }));

  return res.status(StatusCodes.OK).json({
    newData,
  });
});

const ClosevulnerableItems = AsyncHandler(async (req, res) => {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);


  let creator_id = req.query.creator_id || req.currentUser?.tenant;

  const data = await DataModel.find(
    creator_id ? { creator_id } : {}
  );

  let TargetMet = 0;
  let TargetMissed = 0;
  let NoTarget = 0;
  let ApproachingTarget = 0;
  let InFlight = 0;

  for (const item of data) {
    const remediatedDate = item.Remediated_Date ? excelSerialToDate(item.Remediated_Date) : null;
    const statusLower = item.Status?.toLocaleLowerCase();

    if (statusLower?.includes('closed')) {
      TargetMet++;
    }

    if (remediatedDate && statusLower?.includes('open')) {
      TargetMissed++;
    }

    if (!remediatedDate) {
      NoTarget++;
    }

    if (remediatedDate && remediatedDate > today && remediatedDate < futureDate) {
      ApproachingTarget++;
    }

    if (remediatedDate && remediatedDate > futureDate) {
      InFlight++;
    }
  }

  return res.status(StatusCodes.OK).json({
    TargetMet,
    TargetMissed,
    NoTarget,
    ApproachingTarget,
    InFlight,
  });
});

const vulnerableTargets = AsyncHandler(async (_req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1), // Start of current month
          $lt: new Date(currentYear, currentMonth + 1, 0), // End of current month
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month
        name: { $push: { target: '$Status', time: '$Remediated_Date', createdAt: '$createdAt' } },
      },
    },
  ]);

  const newData = data.map((item) => ({
    data: item.name.filter((ite) => ite.target?.toLocaleLowerCase().includes('closed')),
  }))[0];

  const count = newData.data.reduce(
    (r, i) => {
      const remediatedDate = excelSerialToDate(i.time);
      const createdAtDate = new Date(i.createdAt);

      const differenceInDays = (remediatedDate - createdAtDate) / (24 * 60 * 60 * 1000);
      r['totalData'] += differenceInDays;

      return r;
    },
    { totalData: 0 },
  );

  const newCount = newData.data.length ? count.totalData / newData.data.length : 0;

  return res.status(StatusCodes.OK).json({
    averageDifferenceInDays: newCount.toFixed(),
  });
});

const CriticalVulnerable = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Severity: 'Critical', Status: 'Closed' });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const AssignedTask = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Assigned_To } = req.body;
  const find = await DataModel.findById(id).exec();
  if (!find) {
    throw new NotFoundError('Data not found', 'AssignedTask method');
  }
  await DataModel.findByIdAndUpdate(id, { Assigned_To });
  return res.status(StatusCodes.OK).json({
    message: 'Task Assigned Successful',
  });
});

const CriticalHighVulnerable = AsyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const querydata = req.query?.creator_id;
  const tenant = req.currentUser?.tenant;

  const creator_id = querydata ? { creator_id: new mongoose.Types.ObjectId(querydata) } : tenant ? { creator_id: tenant } : "";

  const data = await DataModel.find({ ...creator_id, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

  let webApplication = 0;
  let mobileApplication = 0;
  let ApiServer = 0;

  for (let item of data) {
    if (item.Scan_Type.toLowerCase().includes('web application')) {
      webApplication++;
    }

    if (item.Scan_Type.toLowerCase().includes('mobile application')) {
      mobileApplication++;
    }

    if (item.Scan_Type.toLowerCase().includes('api Server')) {
      ApiServer++;
    }
  }

  return res.status(StatusCodes.OK).json({
    webApplication,
    mobileApplication,
    ApiServer,
  });
});

const CriticalHighVulnerableOverdue = AsyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const querydata = req.query?.creator_id;
  const tenant = req.currentUser?.tenant;

  const creator_id = querydata ? { creator_id: new mongoose.Types.ObjectId(querydata) } : tenant ? { creator_id: tenant } : "";
  const data = await DataModel.find({ ...creator_id, createdAt: { $gte: startOfMonth, $lte: endOfMonth }, $or: [{ Severity: 'High' }, { Severity: 'Critical' }] });

  let webApplication = 0;
  let mobileApplication = 0;
  let ApiServer = 0;

  var todays = new Date();
  todays.setHours(0, 0, 0, 0);

  for (let item of data) {
    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('web application') && excelSerialToDate(item.Remediated_Date) > todays) {
      webApplication++;
    }

    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('mobile application') && excelSerialToDate(item.Remediated_Date) > todays) {
      mobileApplication++;
    }

    if (item.Remediated_Date && item.Scan_Type.toLowerCase().includes('api Server') && excelSerialToDate(item.Remediated_Date) > todays) {
      ApiServer++;
    }
  }

  return res.status(StatusCodes.OK).json({
    webApplication,
    mobileApplication,
    ApiServer,
  });
});

const CriticalHighVulnerableItems = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  // Get the start of the period (two months ago) and the end of the period (current date)
  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  // Fetch data from the database
  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['High', 'Critical'] }, // Only select those with 'High' or 'Critical' severity
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: { $push: { Application_Name: '$Application_Name', Severity: '$Severity', Scan_Type: '$Scan_Type' } },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Helper function to get month name from month number
  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  // Initialize a map to store counts for each application and scan type
  const appCounts = {};

  // Determine the year range dynamically
  const years = new Set();
  data.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  res.status(StatusCodes.OK).json({ results });
});

const LowMediumVulnerableItems = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  // Get the start of the period (two months ago) and the end of the period (current date)
  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  // Fetch data from the database
  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['Low', 'Medium'] }, // Only select those with 'High' or 'Critical' severity
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: { $push: { Application_Name: '$Application_Name', Severity: '$Severity', Scan_Type: '$Scan_Type' } },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  data.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  res.status(StatusCodes.OK).json({ results });
});

const CriticalHighVulnerableItemsOverdue = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['High', 'Critical'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null }, // Ensure Remediated_Date exists and is not null
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' }, // Extract month from createdAt
        year: { $year: '$createdAt' }, // Extract year from createdAt
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: {
          $push: {
            Application_Name: '$Application_Name',
            Severity: '$Severity',
            Scan_Type: '$Scan_Type',
            Remediated_Date: '$Remediated_Date',
            createdAt: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const newdata = data.map((item) => ({
    _id: item._id,
    data: item.data.filter((ite) => moment(ite.Remediated_Date).isBefore(currentDate)),
  }));

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  newdata.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  return res.status(StatusCodes.OK).json({
    results,
  });
});

const LowMediumVulnerableItemsOverdue = AsyncHandler(async (_req, res) => {
  const currentDate = moment();
  const twoMonthsAgo = moment().subtract(2, 'months');

  const startDate = twoMonthsAgo.startOf('month').toDate();
  const endDate = currentDate.endOf('month').toDate();

  const data = await DataModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }, // Filter documents between two months ago and now
        Severity: { $in: ['Low', 'Medium'] }, // Only select those with 'High' or 'Critical' severity
        Remediated_Date: { $exists: true, $ne: null }, // Ensure Remediated_Date exists and is not null
      },
    },
    {
      $addFields: {
        month: { $month: '$createdAt' }, // Extract month from createdAt
        year: { $year: '$createdAt' }, // Extract year from createdAt
      },
    },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        data: {
          $push: {
            Application_Name: '$Application_Name',
            Severity: '$Severity',
            Scan_Type: '$Scan_Type',
            Remediated_Date: '$Remediated_Date',
            createdAt: '$createdAt',
          },
        },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const newdata = data.map((item) => ({
    _id: item._id,
    data: item.data.filter((ite) => moment(ite.Remediated_Date).isBefore(currentDate)),
  }));

  const getMonthName = (month) => {
    return months[month - 1] || '';
  };

  const appCounts = {};

  const years = new Set();
  newdata.forEach((entry) => years.add(entry._id.year));
  const yearRange = Array.from(years).sort().join('-');

  // Iterate through the data and populate the map
  data.forEach((entry) => {
    const month = entry._id.month;
    const monthName = getMonthName(month);

    entry.data.forEach((appData) => {
      const appName = appData.Application_Name;
      const scanType = appData.Scan_Type;

      // Initialize the application entry if it doesn't exist
      if (!appCounts[appName]) {
        appCounts[appName] = {
          year: yearRange, // Dynamic year range
          name: appName,
          scans: [], // Array to store scan types and their counts
        };
      }

      // Find or create the scan type entry
      let scanEntry = appCounts[appName].scans.find((scan) => scan.scanType === scanType);
      if (!scanEntry) {
        scanEntry = { scanType, counts: {} };
        appCounts[appName].scans.push(scanEntry);
      }

      // Initialize the month count if it doesn't exist
      if (!scanEntry.counts[monthName]) {
        scanEntry.counts[monthName] = 0;
      }

      // Increment the count for the corresponding month and scan type
      scanEntry.counts[monthName]++;
    });
  });

  // Convert the map to an array of results
  const results = Object.values(appCounts);

  return res.status(StatusCodes.OK).json({
    results,
  });
});

const ApplicationvulnerabilityCardData = AsyncHandler(async (_req, res) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const data = await DataModel.find({
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    Severity: { $in: ['High', 'Low', 'Medium', 'Critical'] },
  });

  const high = data.filter((item) => item.Severity === 'High').length;
  const low = data.filter((item) => item.Severity === 'Low').length;
  const medium = data.filter((item) => item.Severity === 'Medium').length;
  const critical = data.filter((item) => item.Severity === 'Critical').length;

  return res.status(StatusCodes.OK).json({
    high,
    low,
    medium,
    critical,
  });
});

const BulkAsignedTask = AsyncHandler(async (req, res) => {
  const { tasks, Assigned_To } = req.body;
  if (tasks.length < 0 || !Assigned_To.trim()) {
    throw new NotFoundError('Tasks and Assigned To is required', BulkAsignedTask);
  }
  await DataModel.updateMany({ _id: { $in: tasks } }, { Assigned_To });
  return res.status(StatusCodes.OK).json({
    message: 'Tasks assined Successful',
  });
});

const TopVulnerabilities = AsyncHandler(async (req, res) => {
  let Organization;
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }

  const data = await DataModel.find(
    Organization
      ? { Organization }
      : {}
  ).exec();

  const countMap = {};
  const detailsMap = {};

  data.forEach(item => {
    const title = item.Title?.trim().toLowerCase();
    if (!title) return;

    countMap[title] = (countMap[title] || 0) + 1;

    if (!detailsMap[title]) {
      detailsMap[title] = {
        name: item.Title.trim(),
        exploitability: item.exploitability || 0
      };
    }
  });

  const result = Object.keys(detailsMap).map(key => ({
    ...detailsMap[key],
    count: countMap[key]
  }));

  result.sort((a, b) => b.count - a.count);

  const top5 = result.slice(0, 5);

  return res.status(StatusCodes.OK).json({
    data: top5,
  });
});

const GetAssetsOpenIssues = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { Organization } = req.body;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const data = await DataModel.find({
    Organization,
    Status: 'Open',
  })
    .populate('Assigned_To', 'full_name')
    .skip(skip)
    .limit(limits);

  return res.status(StatusCodes.OK).json({
    data,
  });
});

const GetOrganization = AsyncHandler(async (_req, res) => {
  const find = await DataModel.find({});
  let obj = {};
  let data = [];
  find.map((item) => {
    if (!obj[item.Organization]) {
      obj[item.Organization] = true;
      data.push(item.Organization);
    }
  });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const ExpectionApprove = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  let Organization;
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }

  const data = await DataModel.find(Organization ? { Organization, Status: 'Exception', client_Approve: false } : { Status: 'Exception', client_Approve: false }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.ACCEPTED).json({
    data,
  });
});

const ExpectionVerify = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 20;
  const skip = (pages - 1) * limits;

  let Organization = "";
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }

  const data = await DataModel.find(Organization ? { Status: 'Exception', client_Approve: true, Organization } : { Status: 'Exception', client_Approve: true }).sort({ _id: -1 }).skip(skip).limit(limits);
  return res.status(StatusCodes.ACCEPTED).json({
    data,
  });
});

const UploadPdf = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    throw new NotFoundError('File is required', 'UploadPdf method');
  }
  const { filename } = req.file;
  const path = `${config.NODE_ENV !== 'development' ? config.FILE_URL : config.FILE_URL_LOCAL}/file/${filename}`;

  const find = await DataModel.findById(id);
  if (!find) {
    throw new NotFoundError('data not Found', 'UploadPdf method');
  }
  await DataModel.findByIdAndUpdate(id, { docs: path });
  return res.status(StatusCodes.OK).json({
    message: 'File uploaded successful',
  });
});

const AdminExpectionDataFiftyDays = AsyncHandler(async (req, res) => {
  // Get the current date
  let Organization;
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }
  const currentDate = new Date();

  // First day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // 15th day of the current month (Middle day)
  const middleDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

  // Last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // 15th day of the next month
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);

  // Fetch the data for the date range between the first day of this month and the 15th day of the next month
  const data = await DataModel.find(Organization ? {
    Organization,
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(), // Start date
      $lte: nextMonthDate.toISOString(), // End date
    },
  } : {
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(), // Start date
      $lte: nextMonthDate.toISOString(), // End date
    },
  });

  // Initialize counters
  let one = 0;
  let two = 0;
  let three = 0;

  // Process each data item and categorize by date ranges
  data.forEach((item) => {
    if (item.Expection_time >= firstDayOfMonth && item.Expection_time < middleDayOfMonth) {
      one += 1;
    }

    if (item.Expection_time >= middleDayOfMonth && item.Expection_time < lastDayOfMonth) {
      two += 1;
    }

    if (item.Expection_time >= lastDayOfMonth && item.Expection_time <= nextMonthDate) {
      three += 1;
    }
  });

  // Return response with counts and data
  return res.status(StatusCodes.OK).json({
    '15 days': one,
    '30 days': two,
    '45 days': three,
  });
});

const ClientExpectionDataFiftyDays = AsyncHandler(async (req, res) => {
  let Organization;
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }
  // Get the current date
  const currentDate = new Date();

  // First day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // 15th day of the current month (Middle day)
  const middleDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);

  // Last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // 15th day of the next month
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);

  // Fetch the data for the date range between the first day of this month and the 15th day of the next month
  const data = await DataModel.find(Organization ? {
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(),
      $lte: nextMonthDate.toISOString(),
    },
    Organization: Organization,
  } : {
    Expection_time: {
      $gte: firstDayOfMonth.toISOString(),
      $lte: nextMonthDate.toISOString(),
    }
  });

  // Initialize counters
  let one = 0;
  let two = 0;
  let three = 0;

  // Process each data item and categorize by date ranges
  data.forEach((item) => {
    if (item.Expection_time >= firstDayOfMonth && item.Expection_time < middleDayOfMonth) {
      one += 1;
    }

    if (item.Expection_time >= middleDayOfMonth && item.Expection_time < lastDayOfMonth) {
      two += 1;
    }

    if (item.Expection_time >= lastDayOfMonth && item.Expection_time <= nextMonthDate) {
      three += 1;
    }
  });

  return res.status(StatusCodes.OK).json({
    '15 days': one,
    '30 days': two,
    '45 days': three,
  });
});

const AdminRiskRating = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Status: 'Exception' });

  let monthlyData = {};

  for (let item of data) {
    const itemDate = new Date(item.createdAt);
    const month = itemDate.getMonth() + 1;

    if (!monthlyData[months[month - 1]]) {
      monthlyData[months[month - 1]] = { RiskAccepted: 0, AwaitingApproval: 0 };
    }

    if (item.client_Approve) {
      monthlyData[months[month - 1]].RiskAccepted += 1;
    } else {
      monthlyData[months[month - 1]].AwaitingApproval += 1;
    }
  }

  return res.status(StatusCodes.ACCEPTED).json({
    monthlyData,
  });
});

const ClientRiskRating = AsyncHandler(async (req, res) => {
  let Organization = "";
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }
  const data = await DataModel.find(Organization ? { Status: 'Exception', Organization } : { Status: 'Exception' });
  let monthlyData = {};

  for (let item of data) {
    const itemDate = new Date(item.createdAt);
    const month = itemDate.getMonth() + 1;

    if (!monthlyData[months[month - 1]]) {
      monthlyData[months[month - 1]] = { RiskAccepted: 0, AwaitingApproval: 0 };
    }

    if (item.client_Approve) {
      monthlyData[months[month - 1]].RiskAccepted += 1;
    } else {
      monthlyData[months[month - 1]].AwaitingApproval += 1;
    }
  }

  return res.status(StatusCodes.ACCEPTED).json({
    monthlyData,
  });
});

const AdminDeferredVulnerableItems = AsyncHandler(async (_req, res) => {
  const data = await DataModel.find({ Status: 'Exception' });
  let obj = {};

  for (let item of data) {
    if (!obj[item.Scan_Type]) {
      obj[item.Scan_Type] = 1;
    } else {
      obj[item.Scan_Type] += 1;
    }
  }

  return res.status(StatusCodes.OK).json({
    data: obj,
  });
});

const ClientDeferredVulnerableItems = AsyncHandler(async (req, res) => {
  let Organization = "";
  if (req?.currentUser?.Organization) {
    Organization = req?.currentUser?.Organization;
  } else if (req?.currentUser?.owner) {
    const data = await AuthModel.findById(req?.currentUser?.owner);
    Organization = data?.Organization;
  }
  const data = await DataModel.find(Organization ? { Status: 'Exception', Organization } : { Status: 'Exception' });
  let obj = {};

  for (let item of data) {
    if (!obj[item.Scan_Type]) {
      obj[item.Scan_Type] = 1;
    } else {
      obj[item.Scan_Type] += 1;
    }
  }

  return res.status(StatusCodes.OK).json({
    data: obj,
  });
});

const TopExploitability = AsyncHandler(async (req, res) => {

  const creator_id = req.query.creator_id || req.currentUser?.tenant;
  const data = await DataModel.find(creator_id ? { creator_id } : {});
  const obj = {
    easy: 0,
    network: 0,
    public: 0,
    high: 0
  };

  data.map((item) => {
    if (item.exploitability <= 3) {
      obj.easy += 1;
    } else if (item.exploitability > 3 && item.exploitability <= 5) {
      obj.network += 1;
    } else if (item.exploitability > 5 && item.exploitability <= 7) {
      obj.public += 1;
    } else {
      obj.high += 1;
    }
  });

  let newData = [];

  for (let i in obj) {
    if (i === 'easy') {
      newData.push({ label: "Easily Exploitable", value: parseFloat(((obj[i] * 100) / data.length).toFixed(2)), color: "#ef4444" });
    }
    else if (i === "network") {
      newData.push({ label: "Network Exploitable", value: parseFloat(((obj[i] * 100) / data.length).toFixed(2)), color: "#f97316" });
    }
    else if (i === "public") {
      newData.push({ label: "Public Exploit Available", value: parseFloat(((obj[i] * 100) / data.length).toFixed(2)), color: "#eab308" });
    }
    else {
      newData.push({ label: "High Lateral Movement", value: parseFloat(((obj[i] * 100) / data.length).toFixed(2)), color: "#f472b6" });
    }
  }

  return res.status(StatusCodes.OK).json({
    data: newData
  });

});

export {
  CreateData,
  getApplicationData,
  DeleteManyData,
  DeteleOneData,
  updateOneData,
  DataCounsts,
  vulnerableItems,
  VulnerableRiskRating,
  NewAndCloseVulnerable,
  ClosevulnerableItems,
  vulnerableTargets,
  CriticalVulnerable,
  AssignedTask,
  CriticalHighVulnerable,
  CriticalHighVulnerableOverdue,
  AddNewData,
  CriticalHighVulnerableItems,
  LowMediumVulnerableItems,
  CriticalHighVulnerableItemsOverdue,
  LowMediumVulnerableItemsOverdue,
  ApplicationvulnerabilityCardData,
  BulkAsignedTask,
  TopVulnerabilities,
  GetAssetsOpenIssues,
  GetOrganization,
  ExpectionApprove,
  ExpectionVerify,
  UploadPdf,
  AdminExpectionDataFiftyDays,
  ClientExpectionDataFiftyDays,
  AdminRiskRating,
  ClientRiskRating,
  AdminDeferredVulnerableItems,
  ClientDeferredVulnerableItems,
  TopExploitability,
  getInfrastructureData,
  getAllVulnerabilityData
};
