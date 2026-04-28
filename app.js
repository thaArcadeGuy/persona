const express = require("express")
const cors = require("cors")
const profileRouter = require("./routes/profile.route")
const authRouter = require("./routes/auth.route")
const { connectDB } = require("./config/db")
const passport = require("passport")
require("./config/passport")
const { authLimiter, generalLimiter } = require("./middlewares/rateLimiter.middleware")
const logger = require("./middlewares/logger.middleware")

const app = express()

app.use(express.json())
app.use(cors())
app.use(passport.initialize())

app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use(logger)

app.get("/", (req, res) => {
  res.status(200).json("Welcome to PersonaAPI")
})

app.use("/auth", authLimiter, authRouter)

app.use("/api", generalLimiter, profileRouter)

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found. Please check API documentation"
  })
})

module.exports = app