const { rateLimit } = require("express-rate-limit")

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
})

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = { authLimiter, generalLimiter }