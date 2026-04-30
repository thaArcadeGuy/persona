const User = require("../models/user.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

async function createTestUsers() {
  // Create admin user
  let admin = await User.findOne({ github_id: "test-admin" });
  if (!admin) {
    admin = await User.create({
      github_id: "test-admin",
      username: "test-admin",
      role: "admin",
      is_active: true
    });
  }

  // Create analyst user
  let analyst = await User.findOne({ github_id: "test-analyst" });
  if (!analyst) {
    analyst = await User.create({
      github_id: "test-analyst",
      username: "test-analyst",
      role: "analyst",
      is_active: true
    });
  }

  const adminAccessToken = generateAccessToken(admin);
  const adminRefreshToken = generateRefreshToken(admin);
  const analystAccessToken = generateAccessToken(analyst);

  console.log("Admin Access Token:", adminAccessToken);
  console.log("Admin Refresh Token:", adminRefreshToken);
  console.log("Analyst Access Token:", analystAccessToken);
}

createTestUsers();