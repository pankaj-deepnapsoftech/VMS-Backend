import {Schema,model} from "mongoose";

const JiraSchema = new Schema({
    issue_Description:{type:String,required:true},
    Project_Name:{type:String,required:true},
    Project_Type:{type:String,required:true},
    Priority:{type:String,required:true},
    Assignee:{type:String,required:true},
    Status:{type:String,Required:true},
    Remediated_Date:{type:String,required:true},
    Creator_Email_Address:{type:String,Required:true},
    creator_id:{type:Schema.Types.ObjectId,ref:"User",required:true}
});

export const jiraModel = model("JiraData",JiraSchema)