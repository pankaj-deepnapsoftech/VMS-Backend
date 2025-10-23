import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { calculateALE, calculateARS } from "../utils/calculation.js";
import { InfraStructureAssetModel } from "../models/InsfrastructureAsset.model.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";
import { monthsAggregation, VrocAggraction } from "../services/vroc.service.js";
import { DataModel } from "../models/Data.model.js";
import { VulnerabilityReport } from "../models/nessus.model.js";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



export const GetRiskScoreData = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let year = req.query.year || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  // Fetch main risk data
  const data = await VrocAggraction(matchFilter);

  // ===== Common aggregation function for both models =====
  const getMTTRData = async (Model) => {
    return await Model.aggregate([
      {
        $match: {
          ...matchFilter,
          status: { $in: ["Open", "Closed"] }
        }
      },
      {
        // Calculate days based on status
        $addFields: {
          diffDays: {
            $divide: [
              {
                $subtract: [
                  {
                    $cond: [
                      { $eq: ["$status", "Closed"] },
                      "$updatedAt", // if Closed → use updatedAt
                      new Date()    // if Open → use current date
                    ]
                  },
                  "$createdAt"
                ]
              },
              1000 * 60 * 60 * 24 // convert ms → days
            ]
          }
        }
      },
      {
        // Group by status to get totals and average
        $group: {
          _id: "$status",
          totalDays: { $sum: "$diffDays" },
          count: { $sum: 1 },
          averageDays: { $avg: "$diffDays" }
        }
      },
      {
        // Format output
        $project: {
          _id: 0,
          status: "$_id",
          totalDays: 1,
          count: 1,
          averageDays: { $round: ["$averageDays", 2] }
        }
      }
    ]);
  };

  // ===== Run for both DataModel and VulnerabilityReport =====
  const vuln = await getMTTRData(DataModel);
  const nessus = await getMTTRData(VulnerabilityReport);

  // ===== Combine MTTR results (weighted average) =====
  const combinedMap = new Map();

  const addToMap = (data) => {
    data.forEach(({ status, averageDays, count }) => {
      const existing = combinedMap.get(status) || { totalDays: 0, totalCount: 0 };
      combinedMap.set(status, {
        totalDays: existing.totalDays + averageDays * count,
        totalCount: existing.totalCount + count
      });
    });
  };

  addToMap(vuln);
  addToMap(nessus);

  const combinedAverages = Array.from(
    combinedMap,
    ([status, { totalDays, totalCount }]) => ({
      status,
      averageDays: totalCount > 0
        ? Math.round((totalDays / totalCount) * 100) / 100
        : 0
    })
  );

  // ===== Calculate overall MTTR =====
  const totalMttr = combinedAverages.reduce((sum, item) => sum + item.averageDays, 0);
  const overallMttr =
    combinedAverages.length > 0
      ? Math.round((totalMttr / combinedAverages.length) * 100) / 100
      : 0;

  // ===== Risk and Financial calculations =====
  let riskScore = 0;
  let financial = 0;

  data.forEach((item) => {
    riskScore += parseInt(calculateARS(item)) || 0;
    financial += parseInt(calculateALE(item)) || 0;
  });

  // ===== Final Response =====
  return res.status(StatusCodes.OK).json({
    risk_score: ((riskScore / data.length) * 10).toFixed(2),
    financial,
    mttr: overallMttr,
  });
});


export const AssertInventory = AsyncHandler(async (req, res) => {
  let year = req.query.year || new Date().getFullYear();

  const matchFilter = !req?.currentUser?.role && {
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };


  const infrastructor = await InfraStructureAssetModel.aggregate([
    {
      $match: matchFilter
    },
    {
      $facet: {
        totelCount: [
          { $count: 'count' }
        ],
        cretical: [
          { $match: { modify_criticality: "Critical" } },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        totalCount: { $arrayElemAt: ["$totelCount", 0] },
        critical: { $arrayElemAt: ["$cretical", 0] }
      }
    }
  ]);

  const businessApplication = await ApplicationModel.aggregate([
    {
      $match: matchFilter
    },
    {
      $facet: {
        totelCount: [
          { $count: 'count' }
        ],
        cretical: [
          { $match: { modifyCriticality: "Critical" } },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        totalCount: { $arrayElemAt: ["$totelCount", 0] },
        critical: { $arrayElemAt: ["$cretical", 0] }
      }
    }
  ]);

  res.status(StatusCodes.OK).json({
    infrastructor: infrastructor[0],
    businessApplication: businessApplication[0]
  });
});

export const FinancialExposure = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let year = req.query.year || new Date().getFullYear();
  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator), createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const data = await VrocAggraction(matchFilter);

  const obj = {};

  data.map((item) => {
    if (!obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name]) {
      obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name] = parseInt(calculateARS(item)) || 0;
    } else {
      obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name] += parseInt(calculateARS(item)) || 0;
    }
  });

  res.status(StatusCodes.OK).json({
    data: obj
  });
});


export const TopFiveRiskIndicator = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };


  const data = await VrocAggraction(matchFilter);

  const newData = data
    .map(item => ({ title: item?.Title, severity: item.Severity, RAS: parseInt(calculateARS(item)), exposure: (parseInt(calculateARS(item)) / 1000000).toFixed(5) || 0 }))         // Add RAS field
    .sort((a, b) => b.RAS - a.RAS)                                // Sort descending by RAS
    .slice(0, 5);
  return res.status(StatusCodes.OK).json({
    data: newData
  });
});


export const RiskTrend = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const data = await monthsAggregation(matchFilter);

  // initialize default months data
  const obj = {};

  monthNames.forEach(month => {
    obj[month] = { total: 0, score: 0 };
  });

  // merge actual data
  data.sort((a, b) => a._id - b._id).map((item) => {
    item.data.map((ite) => {
      const monthKey = monthNames[item._id - 1];
      obj[monthKey].total = item.total || 0;
      obj[monthKey].score += parseInt(calculateARS(ite)) || 0;
    });
  });

  return res.status(StatusCodes.OK).json({
    data: obj
  });
});

export const FinancialExposureTrand = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  const data = await monthsAggregation(matchFilter);

  // initialize default months data
  const obj = {};

  monthNames.forEach(month => {
    obj[month] = 0;
  });

  // merge actual data
  data.sort((a, b) => a._id - b._id).map((item) => {
    item.data.map((ite) => {
      const monthKey = monthNames[item._id - 1];
      obj[monthKey] += parseInt(calculateALE(ite)) || 0;
    });
  });

  return res.status(StatusCodes.OK).json({
    data: obj
  });
});

export const RemediationWorkflow = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let { year } = req.query;

  year = parseInt(year) || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    status: { $in: ["Open", "Closed", "Exception"] },
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  // Get grouped data
  const nessus = await VulnerabilityReport.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const vuln = await DataModel.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // ✅ Merge both arrays by status
  const combinedMap = new Map();

  // Add from nessus
  nessus.forEach(item => {
    combinedMap.set(item._id, (combinedMap.get(item._id) || 0) + item.count);
  });

  // Add from vuln
  vuln.forEach(item => {
    combinedMap.set(item._id, (combinedMap.get(item._id) || 0) + item.count);
  });

  let total = 0;
  // Convert map → array
  const newData = Array.from(combinedMap, ([status, count]) => {
    total += count;
    return {
      name: status,
      count
    };
  });

  return res.status(StatusCodes.OK).json({
    data: newData,
    total
  });
});

export const AttackExposure = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  let year = req.query.year || new Date().getFullYear();

  const matchFilter = {
    creator: new mongoose.Types.ObjectId(creator),
    InfraStructureAsset: { $exists: true },
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };

  // Fetch main risk data
  const data = await VrocAggraction(matchFilter);

  const obj = {};

  data.map((item) => {
    if (item.InfraStructureAsset.exposure == 6) {
      if (!obj[item.InfraStructureAsset.asset_hostname]) {
        obj[item.InfraStructureAsset.asset_hostname] = parseInt(calculateARS(item)) || 0;
      } else if (obj[item.InfraStructureAsset.asset_hostname] < (parseInt(calculateARS(item)) || 0)) {
        obj[item.InfraStructureAsset.asset_hostname] = parseInt(calculateARS(item)) || 0;
      }
    }
  });

  

  return res.status(StatusCodes.OK).json({
    data: obj
  });
});












