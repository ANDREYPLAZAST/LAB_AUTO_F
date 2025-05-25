const mongoose = require('mongoose');
require('dotenv').config();

// Cloud MongoDB connection
const connectCloudDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Cloud');
  } catch (err) {
    console.error('Error connecting to MongoDB Cloud:', err);
    process.exit(1);
  }
};

// Local MongoDB connection
const connectLocalDB = async () => {
  try {
    const localConnection = mongoose.createConnection(process.env.MONGODB_LOCAL_URI);
    localConnection.on('error', console.error.bind(console, 'Error connecting to MongoDB Local:'));
    localConnection.once('open', () => {
      console.log('Connected to MongoDB Local');
    });
    return localConnection;
  } catch (err) {
    console.error('Error connecting to MongoDB Local:', err);
    process.exit(1);
  }
};

module.exports = {
  connectCloudDB,
  connectLocalDB
}; 