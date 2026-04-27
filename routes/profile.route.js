const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roles.middleware")
const versionChecker = require("../middlewares/apiVersion.middleware")

apiRouter.post("/profiles", versionChecker, authMiddleware, roleCheck("admin"), profileController.createProfile)
apiRouter.get("/profiles", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.getAllProfiles)
apiRouter.get("/profiles/search", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.searchProfiles)
apiRouter.get("/profiles/:id", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.getProfileById)
apiRouter.delete("/profiles/:id", versionChecker, authMiddleware, roleCheck("admin"), profileController.deleteProfile)

module.exports = apiRouter