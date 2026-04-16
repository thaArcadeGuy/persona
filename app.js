const express = require("express")

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json("Welcome to PersonaAPI")
})

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found. Please API documentation"
  })
})

module.exports = app