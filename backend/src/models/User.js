const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['student', 'teacher'] },

    // Optional compatibility field with current frontend mock data
    classId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


