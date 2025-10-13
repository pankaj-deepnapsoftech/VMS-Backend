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
import { SendMail } from '../utils/SendMain.js';
import moment from 'moment';
import { config } from '../config/env.config.js';
import { calculateARS } from '../utils/calculation.js';


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

  let Exploit_Availale = false, Exploit_Details = "", EPSSData = "";

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
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;

  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), asset_type: "Application" } : { asset_type: "Application" }
    },
    {
      $lookup: {
        from: "severities",
        foreignField: "_id",
        localField: "Severity",
        as: "Severity"
      }
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
        Severity: { $arrayElemAt: ["$Severity", 0] },

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
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;


  const data = await DataModel.aggregate([
    {
      $match: creator ? { creator: new mongoose.Types.ObjectId(creator), asset_type: "Infrastructure" } : { asset_type: "Infrastructure" }
    },
    {
      $lookup: {
        from: "severities",
        foreignField: "_id",
        localField: "Severity",
        as: "Severity"
      }
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
        Severity: { $arrayElemAt: ["$Severity", 0] },
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
        from: "severities",
        foreignField: "_id",
        localField: "Severity",
        as: "Severity"
      }
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
        Severity: { $arrayElemAt: ["$Severity", 0] },
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

const getAllVulnerabilityDataForUser = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const Pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (Pages - 1) * limits;
  const assign = req?.currentUser?._id;

  const data = await DataModel.aggregate([
    {
      $match: { assign: new mongoose.Types.ObjectId(assign) }
    },
    {
      $lookup: {
        from: "severities",
        foreignField: "_id",
        localField: "Severity",
        as: "Severity"
      }
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
        Severity: { $arrayElemAt: ["$Severity", 0] },

      }
    }
  ]).skip(skip)
    .limit(limits)
    .exec();

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

  const result = await DataModel.findByIdAndUpdate(id, { ...update, Exploit_Availale, Exploit_Details, EPSS: EPSSData }).exec();
  res.status(StatusCodes.OK).json({
    message: 'data updated Successful',
  });

  const DataNotify = await DataModel.findById(result._id).populate([{ path: "assign" }, { path: "creator" }, { path: "Severity" }]);


  if (update?.assign) {
    const currentDate = moment().format('YYYY-MM-DD');
    SendMail("VulnerabilityAssigned.ejs",
      {
        partner_name: `${DataNotify?.assign?.fname} ${DataNotify?.assign?.lname}`,
        vuln_id: DataNotify?._id,
        severity: DataNotify?.Severity?.name,
        assigned_by: `${req?.currentUser?.fname} ${req?.currentUser?.lname}`,
        assigned_date: currentDate,
        tenant_name: DataNotify?.creator?.company_name,
        vuln_url: config.NODE_ENV === "developemnt" ? config.CLIENT_URL_LOCAL : config.CLIENT_URL,
      }, { email: DataNotify?.assign?.email, subject: "New Vulnerability Assigned for Review " });
  };


});

const GetTVMCardData = AsyncHandler(async (req, res) => {
  // Get the current year from the query parameter or use the current year as default
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

  const [
    vulnerableData,
    expections,
    infrastructure,
    businessApplication
  ] = await Promise.all([
    DataModel.find(finalFilter), // get all vulnerable data for the current year
    ExpectionModel.aggregate([
      {
        $lookup: {
          from: "datas",
          localField: "vulnerable_data",
          foreignField: "_id",
          as: "vulnerable_data",
        }
      },
      { $unwind: "$vulnerable_data" },
      {
        $match: { "vulnerable_data.createdAt": { $gte: startOfYear, $lt: endOfYear } } // Filter expectations by createdAt
      }
    ]),
    InfraStructureAssetModel.countDocuments(finalFilter), // Filter infrastructure by createdAt
    ApplicationModel.countDocuments(finalFilter) // Filter business applications by createdAt
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

  const currentYear = parseInt(req.query?.year) || new Date().getFullYear();
  // Get the start and end dates for the current year
  const startOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
  const endOfYear = new Date(currentYear + 1, 0, 1); // January 1st of the next year (exclusive)
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.find(creator ? { creator, createdAt: { $gte: startOfYear, $lt: endOfYear } } : { createdAt: { $gte: startOfYear, $lt: endOfYear } });


  let Open = 0, Closed = 0, exception = 0, False_Positive = 0;
  data.map((item) => {
    if (item.status === "Open" || item.status === "Re-Open") Open++;
    if (item.status === "Closed") Closed++;
    if (item.status === "False Positive") False_Positive++;
    if (item.status === "Exception") exception++;

  });

  return res.status(StatusCodes.OK).json({
    Open,
    Closed,
    exception,
    False_Positive,
    total: data.length
  });
});

const TVMSecondChart = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  // 👇 Default to current year if year is not provided
  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    ...(creator ? { creator: new mongoose.Types.ObjectId(creator) } : {}),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const result = await DataModel.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: "severities",
        foreignField: "_id",
        localField: "Severity",
        as: "Severity"
      }
    },
    { $unwind: { path: "$Severity", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          severity: "$Severity.name"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.month",
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
                year: year,
                month: "$_id",
                day: 1
              }
            }
          }
        }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  // Build month map
  const monthMap = new Map();
  result.forEach((item) => {
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

    monthMap.set(item._id, {
      month: item.monthName,
      ...counts
    });
  });

  // Fill in missing months with 0s
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const finalData = Array.from({ length: 12 }, (_, i) => {
    const monthData = monthMap.get(i + 1);
    return monthData || {
      month: monthNames[i],
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Informational: 0
    };
  });

  const label = [], Critical = [], High = [], Medium = [], Low = [], Informational = [];

  finalData.forEach((item) => {
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

const TVMThirdChart = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    ...(creator ? { creator: new mongoose.Types.ObjectId(creator) } : {}),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const aggregationResult = await DataModel.aggregate([
    {
      $match: matchFilter
    },
    {
      $group: {
        _id: {
          isExploitable: { $cond: [{ $ifNull: ["$EPSS", false] }, true, false] }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        type: {
          $cond: [
            { $eq: ["$_id.isExploitable", true] },
            "exploitable",
            "not_exploitable"
          ]
        },
        count: 1
      }
    }
  ]);

  // Ensure both "exploitable" and "not_exploitable" are included
  const defaultCounts = {
    exploitable: 0,
    not_exploitable: 0
  };

  aggregationResult.forEach(item => {
    defaultCounts[item.type] = item.count;
  });

  res.status(StatusCodes.OK).json({
    data: defaultCounts
  });
});

const TVMNinthChart = AsyncHandler(async (req, res) => {

  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    ...(creator ? { creator: new mongoose.Types.ObjectId(creator) } : {}),
    status: { $in: ["Open", "Closed", "Exception"] },
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const result = await DataModel.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.month",
        statuses: {
          $push: {
            status: "$_id.status",
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
                year: year,
                month: "$_id",
                day: 1
              }
            }
          }
        }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // Build a map of month -> status counts
  const monthMap = new Map();
  result.forEach(item => {
    const counts = {
      Open: 0,
      Closed: 0,
      Exception: 0
    };
    item.statuses.forEach(s => {
      counts[s.status] = s.count;
    });

    monthMap.set(item._id, {
      month: item.monthName,
      ...counts
    });
  });

  // Ensure all 12 months are included
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const finalData = Array.from({ length: 12 }, (_, i) => {
    const monthData = monthMap.get(i + 1);
    return monthData || {
      month: monthNames[i],
      Open: 0,
      Closed: 0,
      Exception: 0
    };
  });

  // Format final arrays
  const label = [], Open = [], Closed = [], Exception = [];

  finalData.forEach(item => {
    label.push(item.month);
    Open.push(item.Open);
    Closed.push(item.Closed);
    Exception.push(item.Exception);
  });

  return res.status(StatusCodes.OK).json({
    label,
    Open,
    Closed,
    Exception
  });
});

const TVMthenthChart = AsyncHandler(async (req, res) => {

  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    ...(creator ? { creator: new mongoose.Types.ObjectId(creator) } : {}),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };


  const data = await DataModel.aggregate([
    {
      $match: matchFilter
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
  ]);


  const newData = data
    .map(item => ({ title:item?.Title, RAS: calculateARS(item) }))         // Add RAS field
    .sort((a, b) => b.RAS - a.RAS)                                // Sort descending by RAS
    .slice(0, 5);                                                 // Take top 5



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
  AddNewData,
  getInfrastructureData,
  getAllVulnerabilityData,
  GetTVMCardData,
  TVMFirstChart,
  TVMSecondChart,
  TVMNinthChart,
  getAllVulnerabilityDataForUser,
  TVMThirdChart,
  TVMthenthChart
};
