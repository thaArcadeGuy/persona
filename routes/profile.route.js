const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roles.middleware")
const versionChecker = require("../middlewares/apiVersion.middleware")

apiRouter.post("/profiles", versionChecker, authMiddleware, roleCheck("admin"), profileController.createProfile)
apiRouter.get("/profiles", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.getAllProfiles)
apiRouter.get("/profiles/search", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.searchProfiles)
apiRouter.get("/profiles/export", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.exportProfiles)
apiRouter.get("/users/me", authMiddleware, (req, res) => {
  res.status(200).json({
    status: "success",
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatar_url: req.user.avatar_url,
      role: req.user.role,
      is_active: req.user.is_active,
      last_login_at: req.user.last_login_at
    }
  })
})
apiRouter.get("/profiles/:id", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.getProfileById)
apiRouter.delete("/profiles/:id", versionChecker, authMiddleware, roleCheck("admin"), profileController.deleteProfile)

module.exports = apiRouter