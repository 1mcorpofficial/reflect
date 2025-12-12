const express = require("express");
const Reflection = require("../models/Reflection");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/", requireAuth, requireRole("student"), async (req, res) => {
  const items = await Reflection.find({ studentId: req.user.id }).sort({ createdAt: -1 }).limit(60);
  res.json({ ok: true, items });
});

router.get("/today", requireAuth, requireRole("student"), async (req, res) => {
  const key = todayKey();
  const item = await Reflection.findOne({ studentId: req.user.id, dateKey: key });
  res.json({ ok: true, dateKey: key, item: item || null });
});

router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  const { mood, answers } = req.body || {};
  if (!mood || !answers?.learned || !answers?.hard || !answers?.help) {
    return res.status(400).json({ error: "MISSING_FIELDS" });
  }

  const doc = await Reflection.create({
    studentId: req.user.id,
    dateKey: todayKey(),
    mood: Number(mood),
    answers: {
      learned: String(answers.learned),
      hard: String(answers.hard),
      help: String(answers.help)
    }
  });

  res.json({ ok: true, item: doc });
});

router.get("/:id", requireAuth, requireRole("student"), async (req, res) => {
  const item = await Reflection.findOne({ _id: req.params.id, studentId: req.user.id });
  if (!item) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ ok: true, item });
});

module.exports = router;
