require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const reflectionRoutes = require("./routes/reflections");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5174",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/reflections", reflectionRoutes);

app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({ error: "SERVER_ERROR" });
});

(async () => {
  await connectDB(process.env.MONGO_URI);
  const port = process.env.PORT || 5001;
  app.listen(port, () => console.log(`✅ API with MongoDB on http://localhost:${port}`));
})();
