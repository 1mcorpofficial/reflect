const mongoose = require("mongoose");

const ReflectionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dateKey: { type: String, required: true, index: true }, // YYYY-MM-DD
    mood: { type: Number, min: 1, max: 5, required: true },
    answers: {
      learned: { type: String, required: true },
      hard: { type: String, required: true },
      help: { type: String, required: true }
    },
    teacherComment: { type: String, default: "" }
  },
  { timestamps: true }
);

ReflectionSchema.index({ studentId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("Reflection", ReflectionSchema);
