import { DataModel } from "../models/Data.model.js";


export const getRiskQuntificationData = async (matchFilter) => {
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

  return data;
};











