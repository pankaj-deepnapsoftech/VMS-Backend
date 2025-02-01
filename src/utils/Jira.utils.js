import axios from 'axios';
// local import
import { config } from '../config/env.config.js';

// const auth = {
//   username: config.JIRA_USERNAME,
//   password: config.JIRA_API_KEY,
// };

// const domain = config.DOMAIN;

async function getIssueByID(issueKey) {
  try {
    const config = {
      method: 'get',
      url: domain + '/rest/api/2/issue/' + issueKey,
      headers: { 'Content-Type': 'application/json' },
      auth: auth,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error.response.data.errors);
  }
}

async function getIssues(username,password,domain) {
  const auth = {
    username,
    password
  };
    try {  
      const config = {
        method: 'get',
        url: domain + '/rest/api/2/search',
        headers: { 'Content-Type': 'application/json' },
        auth: auth
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.log(error)
    }
  }
  


export {getIssueByID,getIssues}