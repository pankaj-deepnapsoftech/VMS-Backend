import { StatusCodes } from 'http-status-codes';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { getIssues } from '../utils/Jira.utils.js';
import { JiraConfigModule } from '../models/jiraConfig.model.js';
import { NotFoundError } from '../utils/customError.js';
import { convertExcelToJson } from '../utils/ExcelToJson.js';
import { jiraModel } from '../models/jiraData.model.js';
import { jsDateFromExcelSerial } from '../utils/excelSerialToDate.js';
import mongoose from 'mongoose';
const GetIssuesJira = AsyncHandler(async (req, res) => {
  const id = req.currentUser?._id;
  const find = await JiraConfigModule.findOne({ user_id: id });
  if (!find) {
    throw new NotFoundError('api not found', 'GetIssuesJira method');
  }
  const data = await getIssues(find.JIRA_USERNAME, find.JIRA_API_KEY, find.Domain);

  const newData = data.issues.map((item) => ({
    issueType: {
      id: item.fields?.issuetype?.id,
      description: item.fields?.issuetype?.description,
      name: item.fields?.issuetype?.name,
    },
    project: {
      name: item.fields?.project?.name,
      projectTypeKey: item.fields?.project?.projectTypeKey,
    },
    priority: item.fields?.priority?.name,
    assignee: item.fields?.assignee?.displayName,
    status: item.fields?.status?.name,
    Remediated_Date: item.fields?.customfield_10009,
    creator: {
      accountId: item.fields?.creator?.accountId,
      emailAddress: item.fields?.creator?.emailAddress,
      displayName: item.fields?.creator?.displayName,
    },
  }));

  return res.status(StatusCodes.OK).json({
    newData,
  });
});

const CreateJiraConfig = AsyncHandler(async (req, res) => {
  const { Domain, JIRA_USERNAME, JIRA_API_KEY } = req.body;
  const response = await getIssues(JIRA_USERNAME.trim(), JIRA_API_KEY, Domain.trim());
  if (!response?.expand) {
    throw new NotFoundError('wrong Credentials', 'CreateJiraConfig method');
  }
  const result = await JiraConfigModule.create({ Domain, JIRA_USERNAME, JIRA_API_KEY, user_id: req.currentUser?._id });
  return res.status(StatusCodes.OK).json({
    message: 'configration Submited',
    result,
  });
});

const GetJIraConfig = AsyncHandler(async (req, res) => {
  const data = await JiraConfigModule.findOne({ user_id: req.currentUser?._id });
  return res.status(StatusCodes.OK).json({
    data,
  });
});

const JIraDataViaStatus = AsyncHandler(async (req, res) => {
  // const id = req.currentUser?._id;
  const id = req.query.userid;
  let find;
  if (id){
    find = await jiraModel.find({ creator_id: new mongoose.Types.ObjectId(id) });
  } else {
    find = await jiraModel.find({});
  }
  if (!find) {
    throw new NotFoundError('api not found', 'GetIssuesJira method');
  }
  
  let obj = {};

  find.map((item) => {
    if (!obj[item.Status]) {
      obj[item.Status] = 1;
    } else {
      obj[item.Status] += 1;
    }
  });
  return res.status(StatusCodes.ACCEPTED).json({
    obj,
  });
});

const JIraDataTargetsStatus = AsyncHandler(async (req, res) => {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);

  const id = req.query.userid;
  let data;
  if (id) {
    data = await jiraModel.find({ creator_id: new mongoose.Types.ObjectId(id) });
  } else {
    data = await jiraModel.find({});
  }


  if (!data) {
    throw new NotFoundError('api not found', 'GetIssuesJira method');
  }

  let noTraget = 0;
  let inFlight = 0;
  let targetMissed = 0;
  let targetMet = 0;
  let ApproachingTarget = 0;

  data.forEach((item) => {
    let taskdate;

    if (item?.Remediated_Date) {
      taskdate = jsDateFromExcelSerial(item.Remediated_Date);
    }

    const statusLower = item.Status?.toLowerCase();

    if (!(taskdate instanceof Date) || isNaN(taskdate)) {
      noTraget += 1;
      return;
    }

    const taskDateTime = taskdate.getTime();
    const todayTime = today.getTime();
    const futureDateTime = futureDate.getTime();

    if (futureDateTime <= taskDateTime && statusLower.includes('open')) {
      inFlight += 1;
    }

    if (taskDateTime >= todayTime && futureDateTime >= taskDateTime && statusLower.includes('open')) {
      ApproachingTarget += 1;
    }

    if (statusLower.includes('closed')) {
      targetMet += 1;
    }

    if (taskDateTime < todayTime && statusLower.includes('open')) {
      targetMissed += 1;
    }
  });

  return res.status(StatusCodes.ACCEPTED).json({
    noTraget,
    inFlight,
    targetMissed,
    targetMet,
    ApproachingTarget,
  });
});

const jiraDataWithExcel = AsyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new NotFoundError("file is required field", "jiraDataWithExcel method");
  }

  const data = convertExcelToJson(file.path);
  for (let i of data) {
    await jiraModel.create({ ...i, creator_id: req.currentUser?._id });
  };

  return res.status(StatusCodes.CREATED).json({
    message: "data created successful"
  });

});

const GetJiraManualData = AsyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const pages = parseInt(page) || 1;
  const limits = parseInt(limit) || 10;
  const skip = (pages - 1) * limits;

  const data = await jiraModel.find({ creator_id: req.currentUser?._id }).populate({ path: "creator_id", select: "full_name email" }).skip(skip).limit(limits);
  const modify = data.map((item)=>({
    issueType: {
      id: item?._id,
      description: item?.issue_Description,
      name: item?.issue_type,
    },
    project: {
      name: item?.Project_Name,
      projectTypeKey: item?.Project_Type,
    },
    priority: item?.Priority,
    assignee: item?.Assignee,
    status: item?.Status,
    Remediated_Date: item?.Remediated_Date,
    creator: {
      accountId: item?.creator_id?._id,
      emailAddress: item?.creator_id?.email,
      displayName: item?.creator_id?.full_name,
    },
  }));
  return res.status(StatusCodes.OK).json({
    data:modify
  });

});

const UpdateJiraManualData = AsyncHandler(async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const find = await jiraModel.findById(id);
  if (!find) {
    throw new NotFoundError("Data not found", "UpdatejiraManualdata method");
  }
  await jiraModel.findByIdAndUpdate(id, data);
  return res.status(StatusCodes.OK).json({
    message: "Data updated Successful"
  });
});

const DeleteJiradata = AsyncHandler(async(req,res) => {
  const {id} = req.params;
  const find = await jiraModel.findById(id);
  if(!find){
    throw new NotFoundError("data not found","DeleteJiradata method");
  };

  await jiraModel.findByIdAndDelete(id);
  return res.status(StatusCodes.OK).json({
    message:"data deleted Sussessful"
  });

});

const MultipalDataDeleteJira = AsyncHandler(async(req,res) => { 

  const {id} = req.body;
  if(id?.length <= 0){
    throw new NotFoundError("id is Empty","MultipalDataDeleteJira method");
  }
  await jiraModel.deleteMany({_id:{$in:id}});
  return res.status(StatusCodes.OK).json({
    message:"data deleted Successful"
  });
});

export {
  GetIssuesJira,
  CreateJiraConfig,
  GetJIraConfig,
  JIraDataViaStatus,
  JIraDataTargetsStatus,
  jiraDataWithExcel,
  GetJiraManualData,
  UpdateJiraManualData,
  DeleteJiradata,
  MultipalDataDeleteJira
};
