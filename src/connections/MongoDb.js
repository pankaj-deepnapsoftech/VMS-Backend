import mongoose from 'mongoose';

export const DbConnection = async (uri) => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const connect = await mongoose.connect(uri, { dbName: 'VMS' });
      console.log(`database connected Successful and Host is : ${connect.connection.host}`);
      isConnected = true;
    } catch (error) {
      console.log('mongodb database not connect', error);
      console.log('Try again database connection...');
    }
  }
};
