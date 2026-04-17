const mongoose = require("mongoose")
require("dotenv").config()

const mongoUri = process.env.MONGO_URI

exports.connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection string exists?", !!mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Database connection was successful");
  } catch (error) {
    console.error("Error connecting to database", error);
    process.exit(1);
  }
};