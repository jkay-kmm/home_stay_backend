const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10,          // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000,   // Close sockets after 45 seconds of inactivity
      bufferCommands: false,    // Disable mongoose buffering for better error handling
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Ready state: ${conn.connection.readyState}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;