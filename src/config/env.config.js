import dotenv from "dotenv"
dotenv.config()

class Config {
    NODE_ENV;
    VAPT_CLIENT_URL;
    CLIENT_URL_LOCAL;
    DEMO_CLIENT_URL;
    SECUREND_CLIENT_URL;
    VAPT_MONGODB_URI;
    SECUREND_MONGODB_URI;
    DEMO_MONGODB_URI;
    EMAIL_ID;
    EMAIL_PASSWORD;
    JWT_SECRET;
    DOMAIN;
    JIRA_USERNAME;
    JIRA_API_KEY;
    OPENAPI_API_KEY;
    RECAPTCHA_SECRET;
    ENCRYPTION_KEY;
    NESSUS_MONGODB_URI;
    
    constructor(){
        this.NODE_ENV = process.env.NODE_ENV;
        this.VAPT_CLIENT_URL = process.env.VAPT_CLIENT_URL;
        this.DEMO_CLIENT_URL = process.env.DEMO_CLIENT_URL;
        this.SECUREND_CLIENT_URL = process.env.SECUREND_CLIENT_URL;
        this.CLIENT_URL_LOCAL = process.env.CLIENT_URL_LOCAL;
        this.VAPT_MONGODB_URI = process.env.VAPT_MONGODB_URI;
        this.SECUREND_MONGODB_URI = process.env.SECUREND_MONGODB_URI;
        this.DEMO_MONGODB_URI = process.env.DEMO_MONGODB_URI;
        this.EMAIL_ID = process.env.EMAIL_ID;
        this.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.DOMAIN = process.env.DOMAIN;
        this.JIRA_USERNAME = process.env.JIRA_USERNAME;
        this.JIRA_API_KEY = process.env.JIRA_API_KEY;
        this.FILE_URL = process.env.FILE_URL;
        this.FILE_URL_LOCAL = process.env.FILE_URL_LOCAL;
        this.OPENAPI_API_KEY = process.env.OPENAPI_API_KEY;
        this.RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
        this.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
        this.NESSUS_MONGODB_URI = process.env.NESSUS_MONGODB_URI;
    }
}

export const config = new Config();
