const mongoose = require("mongoose");
const { uuidv7 } = require("uuidv7");

const profileSchema = new mongoose.Schema(
  {
    _id: { 
      type: String, 
      default: () => uuidv7() 
    },
    name: { 
      type: String,
      index: true,
      unique: true
    },
    gender: { 
      type: String, 
      index: true 
    },
    gender_probability: { 
      type: Number 
    },
    age: { 
      type: Number 
    },
    age_group: { 
      type: String, 
      index: true 
    },
    country_id: { 
      type: String, 
      index: true 
    },
    country_name: {
      type: String
    },
    country_probability: { 
      type: Number 
    },
    created_at: { 
      type: Date, 
      default: () => new Date() 
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

module.exports = mongoose.model("Profile", profileSchema);
