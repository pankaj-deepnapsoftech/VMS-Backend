import {string,object} from "yup";


export const JiraConfigValidation = object({
    Domain:string().required("Domain is Required"),
    JIRA_USERNAME:string().required("JIRA USERNAME is Required"),
    JIRA_API_KEY:string().required("JIRA_API_KEY is Required")
})

