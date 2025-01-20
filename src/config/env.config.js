import dotenv from "dotenv"
dotenv.config()

class Config {
    NODE_ENV
    CLIENT_URL
    MONGODB_URI
    constructor(){
        this.NODE_ENV = process.env.NODE_ENV;
        this.CLIENT_URL = process.env.CLIENT_URL;
        this.MONGODB_URI = process.env.MONGODB_URI;
        
    }
}

export const config = new Config();
