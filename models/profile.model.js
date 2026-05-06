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
      unique: true,
      required: true
    },
    gender: { 
      type: String 
    },
    gender_probability: { 
      type: Number 
    },
    age: { 
      type: Number 
    },
    age_group: { 
      type: String
    },
    country_id: { 
      type: String
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

profileSchema.index({ gender: 1, country_id: 1 })
profileSchema.index({ age_group: 1, country_id: 1 })
profileSchema.index({ gender: 1, country_id: 1, age: 1 })

profileSchema.index({ age: 1 })
profileSchema.index({ created_at: -1 })
profileSchema.index({ gender_probability: 1 })

module.exports = mongoose.model("Profile", profileSchema);
