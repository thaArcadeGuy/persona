const jwt = require("jsonwebtoken")
const User = require("../models/user.model")
require("dotenv").config()

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: No token provided"
      })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findOne({ _id: decoded.id })

    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User not found"
      })
    }

    if (!req.user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized: Account is deactivated"
      })
    }

    next()
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
      message: "Unauthorized: Token failed"
    })
  }
}

module.exports = authMiddleware