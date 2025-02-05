import { StatusCodes } from 'http-status-codes';
import { DataModel } from '../models/Data.model.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';


const GetEmployeeTasksData = AsyncHandler(async (req, res) => {
  const id = req.currentUser?._id;
  const find = await DataModel.find({ Assigned_To: id });

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


export { GetEmployeeTasksData, TasksCardData };
