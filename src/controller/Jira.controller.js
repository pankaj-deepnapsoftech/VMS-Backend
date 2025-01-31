import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { getIssues } from "../utils/Jira.utils.js";
import { JiraConfigModule } from "../models/jiraConfig.model.js";



const GetIssuesJira = AsyncHandler(async (_req,res)=>{
    const data = await getIssues();

    const newData = data.issues.map((item)=>({
        issueType:{
            id:item.fields?.issuetype?.id,
            description:item.fields?.issuetype?.description,
            name:item.fields?.issuetype?.name,
        },
        project:{
            name:item.fields?.project?.name,
            projectTypeKey:item.fields?.project?.projectTypeKey,
        },
        priority:item.fields?.priority?.name,
        assignee:item.fields?.assignee?.displayName,
        status:item.fields?.status?.name,
        Remediated_Date:item.fields?.customfield_10009,
        creator:{
            accountId:item.fields?.creator?.accountId,
            emailAddress:item.fields?.creator?.emailAddress,
            displayName:item.fields?.creator?.displayName,
        }
    }))

    return res.status(StatusCodes.OK).json({
        newData
    })
})

const CreateJiraConfig = AsyncHandler(async (req,res) => {
    const data = req.data;
    const result = await JiraConfigModule.create(data)
    return res.status(StatusCodes.OK).json({
        message:"configration Submited",
        result
    })

})

export {GetIssuesJira}