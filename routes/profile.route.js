const express = require("express")
const apiRouter = express.Router()
const profileController = require("../controllers/profile.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roles.middleware")
const versionChecker = require("../middlewares/apiVersion.middleware")
const { cacheMiddleware } = require("../middlewares/cache.middleware")
const upload = require("../middlewares/upload.middleware")

apiRouter.post("/profiles", versionChecker, authMiddleware, roleCheck("admin"), profileController.createProfile)
apiRouter.get("/profiles", versionChecker, authMiddleware, roleCheck("admin", "analyst"), cacheMiddleware(60), profileController.getAllProfiles)
apiRouter.get("/profiles/search", versionChecker, authMiddleware, roleCheck("admin", "analyst"), cacheMiddleware(60), profileController.searchProfiles)
apiRouter.get("/profiles/export", versionChecker, authMiddleware, roleCheck("admin", "analyst"), profileController.exportProfiles)
apiRouter.post("/profiles/import", versionChecker, authMiddleware, roleCheck("admin"), upload.single("file"), profileController.uploadProfiles)
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