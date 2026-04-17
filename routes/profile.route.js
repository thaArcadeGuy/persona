const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")

apiRouter.post("/profiles", profileController.createProfile)
apiRouter.get("/profiles", profileController.getAllProfiles)
apiRouter.get("/profiles/:id", profileController.getProfileById)
apiRouter.delete("/profiles/:id", profileController.deleteProfile)

module.exports = apiRouter