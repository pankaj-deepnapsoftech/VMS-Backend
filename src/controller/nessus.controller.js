import { StatusCodes } from "http-status-codes";
import { VulnerabilityReport } from "../models/nessus.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { DataModel } from "../models/Data.model.js";

export const GetNessusData = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

  // Convert to integers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Calculate the skip values
  const skipVulnerability = (pageNum - 1) * limitNum;
  const skipDataModel = (pageNum - 1) * limitNum;

  // Fetch the first `limit` records from `VulnerabilityReport`
  const vulnerabilityData = await VulnerabilityReport.find({})
    .skip(skipVulnerability)
    .limit(limitNum)
    .exec();

  // Fetch the next `limit` records from `DataModel`
  const dataModelData = await DataModel.find({})
    .skip(skipDataModel)
    .limit(limitNum)
    .exec();

  // Combine both datasets
  const combinedData = [...vulnerabilityData, ...dataModelData];

  return res.status(StatusCodes.OK).json({
    message: "Data fetched successfully",
    data: combinedData, // Merged data
    page: pageNum,
    limit: limitNum,
    total: combinedData.length, // Total length of merged data
  });
});
