import { StatusCodes } from 'http-status-codes';
import { DataModel } from '../models/Data.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { AuthModel } from '../models/Auth.model.js';

const GetEmployeeTasksData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const id = req.currentUser?._id;
  const find = await DataModel.find({ Assigned_To: id }).populate({path:"creator_id",select:"full_name"}).sort({_id:-1}).skip(skip).limit(limits);

  const data = find.map((item)=>({
    _id:item._id,
    Organization:item?.Organization,
    Application_Name:item?.Application_Name,
    Title:item?.Title,
    Vulnerability_Classification:item?.Vulnerability_Classification,
    Scan_Type:item?.Scan_Type,
    Severity:item?.Severity,
    Priority:item?.Priority,
    Status:item?.Status,
    Remediated_Date:item?.Remediated_Date,
    Ageing:item?.Ageing,
    Remediate_Upcoming_Time_Line:item?.Remediate_Upcoming_Time_Line,
    creator:item?.creator_id?.full_name,
  }))

  return res.status(StatusCodes.OK).json({
    message: 'tasks',
    data: data,
  });
});

const TasksCardData = AsyncHandler(async (req, res) => {
  const id = req.currentUser?._id;
  const data = await DataModel.find({ Assigned_To: id });

  const totalData = data.length;
  const inProgress = data.filter((item) => item.Status?.toLocaleLowerCase().includes('open')).length;
  const open = data.filter((item) => item.Status?.toLocaleLowerCase() === 'open').length;
  const reopen = data.filter((item) => item.Status?.toLocaleLowerCase().includes('reopen')).length;
  const closed = data.filter((item) => item.Status?.toLocaleLowerCase().includes('closed')).length;
  const onHold = data.filter((item) => item.Status?.toLocaleLowerCase().includes('on hold')).length;

  return res.status(StatusCodes.OK).json({
    totalData,
    inProgress,
    open,
    reopen,
    closed,
    onHold,
  });
});

const getOrgnization = AsyncHandler(async (_req,res)=>{
 const data = await AuthModel.find({role:"ClientSME"}).select("role phone email full_name");
  return res.status(StatusCodes.OK).json({
    data
  })
})

export { GetEmployeeTasksData, TasksCardData,getOrgnization };
