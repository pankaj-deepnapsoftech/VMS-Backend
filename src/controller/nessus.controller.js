import { StatusCodes } from "http-status-codes";
import { VulnerabilityReport } from "../models/nessus.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { DataModel } from "../models/Data.model.js";

export const GetNessusData = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Calculate skip for the first collection
  const skip = (pageNum - 1) * limitNum;

  // 1️⃣ Get total counts for both models
  const [vulnCount, dataModelCount] = await Promise.all([
    VulnerabilityReport.countDocuments(),
    DataModel.countDocuments(),
  ]);

  // 2️⃣ Calculate total items across both collections
  const totalCount = vulnCount + dataModelCount;

  // 3️⃣ Start fetching data
  let vulnerabilityData = [];
  let dataModelData = [];

  // If skip is within vulnerability data range
  if (skip < vulnCount) {
    // Fetch vulnerability data with pagination
    vulnerabilityData = await VulnerabilityReport.find({})
      .skip(skip)
      .limit(limitNum)
      .exec();

    // Check if we still need more data to fill the page
    const remainingLimit = limitNum - vulnerabilityData.length;

    if (remainingLimit > 0) {
      // Get extra from DataModel
      dataModelData = await DataModel.find({}).populate([{path:"Severity"},{path:"InfraStructureAsset"},{path:"BusinessApplication"}])
        .limit(remainingLimit)
        .exec();
    }
  } else {
    // If we’ve already passed all vulnerability data, skip into DataModel
    const dataSkip = skip - vulnCount;

    dataModelData = await DataModel.find({}).populate([{path:"Severity"},{path:"InfraStructureAsset"},{path:"BusinessApplication"}])
      .skip(dataSkip)
      .limit(limitNum)
      .exec();
  }

  // Merge both datasets
  const combinedData = [...vulnerabilityData, ...dataModelData];

  return res.status(StatusCodes.OK).json({
    message: "Data fetched successfully",
    data: combinedData,
    page: pageNum,
    limit: limitNum,
    total: totalCount,
  });
});


export const DeleteNessusData = AsyncHandler(async (req,res) => {
  const {id} = req.params;

  let nessus = await VulnerabilityReport.findByIdAndDelete(id);

  if(!nessus){
    nessus = await DataModel.findByIdAndDelete(id);
  };

  return res.status(StatusCodes.OK).json({
    message:"Data Deleted",
    data:nessus
  });
});
