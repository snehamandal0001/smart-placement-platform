import mongoose from "mongoose";

// Function to establish connection with MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Log successful connection host
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server process
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // 1 indicates an exit with error
  }
};

export default connectDB;