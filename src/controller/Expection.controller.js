import { StatusCodes } from "http-status-codes";
import { ExpectionModel } from "../models/RequestExpection.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { NotFoundError } from "../utils/customError.js";
import mongoose from "mongoose";
import { DataModel } from "../models/Data.model.js";
import { SendMail } from "../utils/SendMain.js";
import moment from "moment";
import { config } from "../config/env.config.js";



export const CreateExpection = AsyncHandler(async (req, res) => {
  const data = req.body;
  const result = await ExpectionModel.create({ ...data, creator: req?.currentUser?._id });
  await DataModel.findByIdAndUpdate(data.vulnerable_data, { status: "Exception" });
  return res.status(StatusCodes.CREATED).json({
    message: "Expection created successful",
    data: result
  });
});


export const GetExpection = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const creator = req?.currentUser?.tenant || req.query?.tenant;



  const data = await ExpectionModel.aggregate([
    {
      $lookup: {
        from: "datas",
        localField: "vulnerable_data",
        foreignField: "_id",
        as: "vulnerable_data",
      }
    },
    {
      $addFields: {
        vulnerable_data: {
          $arrayElemAt: ["$vulnerable_data", 0]
        }
      }
    }, {
      $match: creator ? {
        "vulnerable_data.creator": new mongoose.Types.ObjectId(creator) // Match inside joined data
      } : {}

    }
  ]).sort({ _id: -1 }).skip(skip).limit(limits);


  // const data = await ExpectionModel.find({}).populate("vulnerable_data").sort({_id:-1}).skip(skip).limit(limits);
  return res.status(StatusCodes.OK).json({
    message: "data",
    data
  });

});


export const DeleteExpection = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const find = await ExpectionModel.findById(id);
  if (!find) {
    throw new NotFoundError("data not found", "DeleteExpection method ()");
  }

  await ExpectionModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message: "Expection Deleted Successful"
  });
});



export const UpdateExpection = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const find = await ExpectionModel.findById(id);
  if (!find) {
    throw new NotFoundError("data not found", "DeleteExpection method ()");
  }

  const result = await ExpectionModel.findByIdAndUpdate(id, data);
  res.status(StatusCodes.OK).json({
    message: "Expection Updated Successful"
  });

  const newData = await ExpectionModel.findById(result._id).populate([{ path: "vulnerable_data" }, { path: "aprove_1.approver" }, { path: "aprove_2.approver" }, { path: "aprove_3.approver" }]);

  const emails = [];

  if (newData?.aprove_1?.approver?.email) {
    emails.push({email:newData?.aprove_1?.approver?.email,name:`${newData?.aprove_1?.approver?.fname} ${newData?.aprove_1?.approver?.lname}`});
  }

  if (newData?.aprove_2?.approver?.email) {
    emails.push({email:newData?.aprove_2?.approver?.email,name:`${newData?.aprove_2?.approver?.fname} ${newData?.aprove_2?.approver?.lname}`});
  }

  if (newData?.aprove_3?.approver?.email) {
    emails.push({email:newData?.aprove_3?.approver?.email,name:`${newData?.aprove_3?.approver?.fname} ${newData?.aprove_3?.approver?.lname}`});
  }

  const date = moment().format("DD-MM-YYYY");

  emails.map((item)=>{

    SendMail('ExceptionRequest.ejs', {
      tenant_admin :item.name,
      requested_by :`${req?.currentUser?.fname} ${req?.currentUser?.lname}`,
      vuln_id :newData?.vulnerable_data?._id,
      exception_reason : newData.reason,
      requested_date : date,
      exception_url: config.NODE_ENV === "development" ? config.CLIENT_URL_LOCAL : config.CLIENT_URL 
    }, { email: item.email, subject: `Exception Request Submitted — ${newData?.vulnerable_data?._id}` });
  });



});





