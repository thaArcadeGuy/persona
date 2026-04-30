const express = require("express")
const apiRouter = express.Router()
const passport = require("passport")
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens")
const authMiddleware = require("../middlewares/auth.middleware")
const jwt = require("jsonwebtoken")
const BlockedToken = require("../models/blockedToken.model")
const User = require("../models/user.model")
const axios = require("axios")
require("dotenv").config()

apiRouter.get("/github", passport.authenticate("github", { scope: [ "user:email" ] }))

apiRouter.get("/github/callback", (req, res, next) => {
  const portalUrl = process.env.PORTAL_URL || "http://localhost:4000"
  const state = req.query.state || ""
  const isPortal = state === "portal"
  const isCli = state.startsWith("cli_")

  passport.authenticate("github", (error, user, info) => {
    if (error) console.error("GitHub auth error:", error.message)

    if (error) {
      if (isPortal) return res.redirect(`${portalUrl}/login?error=auth_failed`)
      return res.status(500).json({ status: "error", message: "Authentication failed" })
    }

    if (!user) {
      if (isPortal) return res.redirect(`${portalUrl}/login?error=auth_denied`)
      return res.status(401).json({ status: "error", message: "Authentication denied" })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    const tokenParams = `access_token=${accessToken}&refresh_token=${refreshToken}&username=${user.username}&role=${user.role}&id=${user.id}`

    if (isCli) {
      const cliPort = parseInt(state.replace("cli_", ""))
      if (isNaN(cliPort) || cliPort < 1024 || cliPort > 65535) {
        return res.status(400).json({ status: "error", message: "Invalid callback port" })
      }
      return res.redirect(`http://localhost:${cliPort}/callback?${tokenParams}`)
    }

    if (isPortal) {
      return res.redirect(`${portalUrl}/callback?${tokenParams}`)
    }

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

apiRouter.get("/me", authMiddleware, (req, res) => {
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

apiRouter.post("/github/cli-callback", async (req, res) => {
  try {
    const { code, code_verifier } = req.body

    if (!code || !code_verifier) {
      return res.status(400).json({
        status: "error",
        message: "code and code_verifier are required"
      })
    }

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        code_verifier
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    )

    const githubAccessToken = tokenResponse.data.access_token

    if (!githubAccessToken) {
      const reason = tokenResponse.data.error_description
        || tokenResponse.data.error
        || "Unknown error"
      console.error("GitHub token error:", reason)
      return res.status(401).json({
        status: "error",
        message: "Failed to get access token from GitHub"
      })
    }

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github+json"
      }
    })

    const profile = profileResponse.data
    let email = profile.email

    if (!email) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      })

      const primaryEmail = emailResponse.data.find(e => e.primary && e.verified)
      email = primaryEmail?.email || null
    }

    let user = await User.findOne({ github_id: profile.id })

    if (user) {
      user.last_login_at = new Date()
      await user.save()
    } else {
      user = await User.create({
        github_id: profile.id,
        username: profile.login,
        email,
        avatar_url: profile.avatar_url,
        last_login_at: new Date()
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

  } catch (error) {
    console.error("CLI GitHub Auth Error:", error.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message: "Github CLI authentication failed"
    })
  }
})

apiRouter.post("/refresh", async (req, res) => {
  console.log("HEADERS:", req.headers["content-type"])  // should print "application/json"
  console.log("BODY:", req.body)
  const token = req.body?.refresh_token

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

apiRouter.post("/logout", async (req, res) => {
  const { refresh_token } = req.body || {}

  if(!refresh_token) {
    return res.status(400).json({
      status: "error",
      message: "Refresh token is required"
    })
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET)

    await BlockedToken.create({
      token: refresh_token,
      expiresAt: new Date(decoded.exp * 1000)
    })

    res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    })

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(200).json({
        status: "success",
        message: "Logged out successfully"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid token"
      })
    }

    res.status(500).json({
      status: "error",
      message: "Failed to log out",
    });
  }
})

module.exports = apiRouter