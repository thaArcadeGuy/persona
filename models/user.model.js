const mongoose = require("mongoose");
const { uuidv7 } = require("uuidv7");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv7(),
    },
    github_id: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    avatar_url: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "analyst"],
      default: "analyst"
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_login_at: {
      type: Date,
    },
    created_at: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    _id: false,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userSchema)
