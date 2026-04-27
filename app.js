const express = require("express")
const cors = require("cors")
const apiRouter = require("./routes/profile.route")
const { connectDB } = require("./config/db")
const passport = require("passport")
require("./config/passport")

const app = express()

app.use(express.json())
app.use(cors())
app.use(passport.initialize())

app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.get("/", (req, res) => {
  res.status(200).json("Welcome to PersonaAPI")
})

app.use("/api", apiRouter)

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found. Please check API documentation"
  })
})

module.exports = app