const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")

apiRouter.post("/profile", profileController.createProfile)

module.exports = apiRouter