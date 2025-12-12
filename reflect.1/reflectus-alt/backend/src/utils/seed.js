require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("../config/db");
const User = require("../models/User");

(async () => {
  await connectDB(process.env.MONGO_URI);

  const email = "student@test.lt";
  const existing = await User.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Test12345!", 12);
    await User.create({
      email,
      role: "student",
      passwordHash,
      status: "active",
      mustChangePassword: false,
      firstName: "Test",
      lastName: "Student"
    });
    console.log("✅ Seeded:", email, "password: Test12345!");
  } else {
    console.log("ℹ️ Already exists:", email);
  }

  process.exit(0);
})();
