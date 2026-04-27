const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roles.middleware")

apiRouter.post("/profiles", authMiddleware, roleCheck("admin"), profileController.createProfile)
apiRouter.get("/profiles", authMiddleware, roleCheck("admin", "analyst"), profileController.getAllProfiles)
apiRouter.get("/profiles/search", authMiddleware, roleCheck("admin", "analyst"), profileController.searchProfiles)
apiRouter.get("/profiles/:id", authMiddleware, roleCheck("admin", "analyst"), profileController.getProfileById)
apiRouter.delete("/profiles/:id", authMiddleware, roleCheck("admin"), profileController.deleteProfile)

module.exports = apiRouter