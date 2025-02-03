import { StatusCodes } from 'http-status-codes';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { getIssues } from '../utils/Jira.utils.js';
import { JiraConfigModule } from '../models/jiraConfig.model.js';
import { NotFoundError } from '../utils/customError.js';

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
  const data = await JiraConfigModule.findOne({user_id:req.currentUser?._id});
  return res.status(StatusCodes.OK).json({
    data,
  });
});

export { GetIssuesJira, CreateJiraConfig, GetJIraConfig };
