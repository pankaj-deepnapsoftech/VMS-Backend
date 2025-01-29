import { model, Schema } from "mongoose";


const JiraConfigSchema = new Schema({
    Domain:{
        type:String,
        required:true
    },
    JIRA_USERNAME:{
        type:String,
        required:true
    },
    JIRA_API_KEY:{
        type:String,
        required:true
    }
})

export const JiraConfigModule = model("JiraConfig",JiraConfigSchema)

