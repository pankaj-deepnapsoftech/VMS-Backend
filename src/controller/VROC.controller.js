import mongoose from "mongoose";
import { DataModel } from "../models/Data.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { calculateALE, calculateARS } from "../utils/calculation.js";
import { InfraStructureAssetModel } from "../models/InsfrastructureAsset.model.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";


export const GetRiskScoreData = AsyncHandler(async (req, res) => {
  const creator = req?.currentUser?.tenant || req.query?.tenant;
  const data = await DataModel.aggregate([
    {
      $match: { creator: new mongoose.Types.ObjectId(creator), }
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



  let riskScore = 0;
  let financial = 0;
  data.map((item) => {
    riskScore += parseInt(calculateARS(item)) || 0;
    financial += parseInt(calculateALE(item)) || 0;
  });


  return res.status(StatusCodes.OK).json({
    risk_score: (((riskScore / data.length) * 1000) / 100).toFixed(2),
    financial,
    data
  });
});


export const AssertInventory = AsyncHandler(async (req, res) => {
  let { year } = req.query;
  year = new Date().getFullYear();

  const matchFilter = !req?.currentUser?.role && {
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00Z`),
      $lte: new Date(`${year}-12-31T23:59:59Z`)
    }
  };


  const assertInventory = await InfraStructureAssetModel.aggregate([
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

  const infrastructor = await ApplicationModel.aggregate([
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
    assertInventory:assertInventory[0],
    infrastructor:infrastructor[0]
  });
});














