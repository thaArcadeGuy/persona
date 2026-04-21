const mongoose = require("mongoose")
const fs = require("fs").promises
const path = require("path")
const Profile = require("../models/profile.model")
require("dotenv").config()

const mongoUri = process.env.MONGO_URI

async function readJSON(filename) {
  const filepath = path.join(__dirname, "..", "data", filename)
  console.log(filepath)

  try {
    const data = await fs.readFile(filepath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ile: ${error.message}`);
    return null; 
  }
  
}

async function seedDatabase() {
  try {
    console.log("Starting database seed...")

    // 1. Connect to database
    await mongoose.connect(mongoUri)
    console.log("Connected to DB")

    // 2. Read profiles.json
    const profilesData = await readJSON("profiles.json")
    if (!profilesData || !profilesData.profiles) {
      throw new Error("Failed to read profiles data")
    }
    
    const profiles = profilesData.profiles
    console.log(`Found ${profiles.length} profiles in seed file`)

    // 3. For each profile, check if name exists
    // 4. If not exists → Add to "toInsert" array
    const profilesToInsert = []
    let skippedCount = 0

    for (const profile of profiles) {
      const nameExists = await Profile.findOne({name: profile.name})
      if (!nameExists) {
        profilesToInsert.push(profile)
      } else {
        skippedCount++
      }
    }

    console.log(`${profilesToInsert.length} new profiles to insert, ${skippedCount} duplicates skipped`)

    // 5. Insert the "toInsert" array in chunks
    const chunkSize = 100
    let insertedCount = 0

    for (let i = 0; i < profilesToInsert.length; i += chunkSize) {
      const chunk = profilesToInsert.slice(i, i + chunkSize)
      const result = await Profile.insertMany(chunk, { ordered: false })

      insertedCount += result.length
      console.log(`Chunk ${Math.floor(i / chunkSize) + 1}: Inserted ${result.length} profiles`)
    }

    // 6. Report: "Seeded X new profiles, skipped Y duplicates"
      console.log(`Seeded ${insertedCount} profiles and skipped ${skippedCount} duplicates`)
    
    // 7. Disconnect
     await mongoose.disconnect();
     console.log("Disconnected from DB")

  } catch (error) {
    console.error("Seeding failed:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase