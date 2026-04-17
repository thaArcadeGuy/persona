const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")

apiRouter.post("/profiles", profileController.createProfile)
apiRouter.get("/profiles/:id", profileController.getProfileById)

module.exports = apiRouter