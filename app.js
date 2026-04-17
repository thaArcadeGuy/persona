const express = require("express")
const cors = require("cors")
const apiRouter = require("./routes/profile.route")

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.status(200).json("Welcome to PersonaAPI")
})

app.post("/test-json", (req, res) => {
  console.log("req.body:", req.body)
  res.json({ received: req.body })
})

app.use("/api", apiRouter)

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found. Please API documentation"
  })
})

module.exports = app