import { StatusCodes } from 'http-status-codes';
import { DataModel } from '../models/Data.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';

const GetEmployeeTasksData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;
  const id = req.currentUser?._id;
  const find = await DataModel.find({ Assigned_To: id }).sort({_id:-1}).skip(skip).limit(limits);

  return res.status(StatusCodes.OK).json({
    message: 'tasks',
    data: find,
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
 const data =await AuthModel.find({role:"ClientSME"})
  return res.status(StatusCodes.OK).json({
    data
  })
})

export { GetEmployeeTasksData, TasksCardData,getOrgnization };
