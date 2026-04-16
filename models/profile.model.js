const mongoose = require("mongoose")
const { generate } = require("@babia/uuid-v7/generate")

const profileSchema = new mongoose.Schema({
  id: { type: String, default: () => generate() },
  name: { type: String, lowercase: true, index: true },
  gender: { type: String , index: true},
  gender_probability: { type: Number },
  sample_size: { type: Number },
  age: { type: Number },
  age_group: { type: String, index: true },
  country_id: { type: String, index: true },
  country_probability: { type: Number },
  created_at: { type: Date, default: () => new Date() }
})


module.exports = mongoose.model("Profile", profileSchema)