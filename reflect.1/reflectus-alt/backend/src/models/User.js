const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["student", "teacher", "school_admin"], required: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    mustChangePassword: { type: Boolean, default: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
