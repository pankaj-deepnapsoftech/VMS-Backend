/* eslint-disable no-console */
// local imports
import { config } from './config/env.config.js';
import { DbConnection } from './connections/MongoDb.js';
import { app } from './server.js';


export function handleNodeEnv(type) {
  switch (type) {
  case "vapt":
    return { SERVER_PORT: 8078, MONGODB_URI: config.VAPT_MONGODB_URI,client:config.VAPT_CLIENT_URL };
  case 'demo':
    return { SERVER_PORT: 8095, MONGODB_URI: config.DEMO_MONGODB_URI,client:config.DEMO_CLIENT_URL };
  case 'securend':
    return { SERVER_PORT: 8092, MONGODB_URI: config.SECUREND_MONGODB_URI,client:config.SECUREND_CLIENT_URL };
  default:
    return { SERVER_PORT: 5000, MONGODB_URI: config.VAPT_MONGODB_URI,client:config.CLIENT_URL_LOCAL };
  }
}



const startServer = async () => {
  const handler = handleNodeEnv(config.NODE_ENV);
  app.listen(handler.SERVER_PORT);
  console.log('Server is up and running on port : %d ', handler.SERVER_PORT);
  await DbConnection(handler.MONGODB_URI);
};

startServer();



