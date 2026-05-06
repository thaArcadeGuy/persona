const mongoose = require("mongoose")
require("dotenv").config()

const mongoUri = process.env.MONGO_URI

exports.connectDB = async () => {
  if (mongoose.connection.readyState === 1) return

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, 
    })
    await mongoose.set('bufferCommands', false)
    console.log("Database connection was successful")
  } catch (error) {
    console.error("Error connecting to database:", error.message)
    throw error 
  }
}