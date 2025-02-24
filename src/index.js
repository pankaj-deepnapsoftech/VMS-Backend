// local imports
import { config } from './config/env.config.js';
import { DbConnection } from './connections/MongoDb.js';
import { app } from './server.js';

const SERVER_PORT = 8078;

const startServer = async () => {
  app.listen(SERVER_PORT);
  console.log('Server is up and running on port : %d ', SERVER_PORT);
  await DbConnection(config.MONGODB_URI); 
};

startServer();
