import { StatusCodes } from "http-status-codes";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { getIssues } from "../utils/Jira.utils.js";



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

export {GetIssuesJira}