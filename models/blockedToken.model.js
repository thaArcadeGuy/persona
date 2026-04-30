const mongoose = require("mongoose")

const blockedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }
)

blockedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("BlockedToken", blockedTokenSchema)