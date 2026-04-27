const express = require("express")
const apiRouter = express.Router()
const passport = require("passport")
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens")
const jwt = require("jsonwebtoken")
const BlockedToken = require("../models/blockedToken.model")
const User = require("../models/user.model")

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

apiRouter.post("/refresh", async (req, res, next) => {
  const token = req.body.refresh_token

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Refresh token is required"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const exists = await BlockedToken.findOne({ token })

    if (exists) {
      return res.status(403).json({
        status: "error",
        message: "Token already used"
      })
    }

    const user = await User.findOne({ _id: decoded.id }) 

    if (!user) {
      return res.status(404).json({ 
        status: "error",
        message: "User not found" 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "Account is deactivated"
      })
    }

    
    await BlockedToken.create({
      token: token,
      expiresAt: new Date(decoded.exp * 1000)
    })


    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.status(200).json({
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const expiredAt = error.expiredAt
      return res.status(401).json({
        status: "error",
        message: `Token expired at: ${expiredAt}`
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token"
      })
    }

    res.status(500).json({
      status: "error",
      message: "Failed to get refresh token",
    });
  }
})

module.exports = apiRouter