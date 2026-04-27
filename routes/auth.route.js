const express = require("express")
const apiRouter = express.Router()
const passport = require("passport")
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens")

apiRouter.get("/github", passport.authenticate("github", { scope: [ "user:email" ] }))

apiRouter.get("/github/callback", (req, res, next) => {
  passport.authenticate("github", (error, user, info) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Authentication failed"
      })
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication denied"
      })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.status(200).json({
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  })(req, res, next)
})

module.exports = apiRouter