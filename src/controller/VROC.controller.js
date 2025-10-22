import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { calculateALE, calculateARS } from "../utils/calculation.js";
import { InfraStructureAssetModel } from "../models/InsfrastructureAsset.model.js";
import { ApplicationModel } from "../models/BusinessApplications.model.js";
import { VrocAggraction } from "../services/vroc.service.js";
import { getRiskQuntificationData } from "../services/data.service.js";


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

  const data = await VrocAggraction(matchFilter);



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

  data.map((item)=>{
    if(!obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name]){
      obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name] = parseInt(calculateARS(item)) || 0;
    }else{
      obj[item?.InfraStructureAsset?.tag_name || item?.BusinessApplication?.tag_name] += parseInt(calculateARS(item)) || 0;
    }
  });

  res.status(StatusCodes.OK).json({
    data:obj
  });
});


export const TopFiveRiskIndicator = AsyncHandler(async (req,res) => {
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
    .map(item => ({ title: item?.Title,severity:item.Severity, RAS: parseInt(calculateARS(item)),exposure:(parseInt(calculateARS(item)) / 1000000 ).toFixed(5) || 0 }))         // Add RAS field
    .sort((a, b) => b.RAS - a.RAS)                                // Sort descending by RAS
    .slice(0, 5); 
  return res.status(StatusCodes.OK).json({
    data:newData
  });
});













