import dotenv from "dotenv"
dotenv.config()

class Config {
    NODE_ENV;
    CLIENT_URL;
    MONGODB_URI;
    EMAIL_ID;
    EMAIL_PASSWORD;
    JWT_SECRET;
    DOMAIN;
    JIRA_USERNAME;
    JIRA_API_KEY
    constructor(){
        this.NODE_ENV = process.env.NODE_ENV;
        this.CLIENT_URL = process.env.CLIENT_URL;
        this.MONGODB_URI = process.env.MONGODB_URI;
        this.EMAIL_ID = process.env.EMAIL_ID;
        this.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.DOMAIN = process.env.DOMAIN;
        this.JIRA_USERNAME = process.env.JIRA_USERNAME;
        this.JIRA_API_KEY = process.env.JIRA_API_KEY;
        
    }
}

export const config = new Config();
