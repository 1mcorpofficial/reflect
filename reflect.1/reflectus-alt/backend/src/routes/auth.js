const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "MISSING_FIELDS" });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || user.status !== "active") return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  });

  res.json({
    ok: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token", { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("email role mustChangePassword firstName lastName status");
  if (!user || user.status !== "active") return res.status(401).json({ error: "UNAUTHORIZED" });
  res.json({ ok: true, user });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) return res.status(400).json({ error: "WEAK_PASSWORD" });

  const passwordHash = await bcrypt.hash(String(newPassword), 12);
  await User.findByIdAndUpdate(req.user.id, { passwordHash, mustChangePassword: false });

  res.json({ ok: true });
});

module.exports = router;
