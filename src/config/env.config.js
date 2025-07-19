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
    JIRA_API_KEY;
    CLIENT_URL_LOCAL;
    FILE_URL;
    FILE_URL_LOCAL;
    OPENAPI_API_KEY;
    RECAPTCHA_SECRET;
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
        this.FILE_URL = process.env.FILE_URL;
        this.FILE_URL_LOCAL = process.env.FILE_URL_LOCAL;
        this.CLIENT_URL_LOCAL = process.env.CLIENT_URL_LOCAL;
        this.OPENAPI_API_KEY = process.env.OPENAPI_API_KEY;
        this.RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
    }
}

export const config = new Config();
