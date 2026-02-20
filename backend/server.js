require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ✅ DB
const { sequelize, connectDB } = require("./config/db");

// 🔥 VERY IMPORTANT (LOAD ALL MODELS + RELATIONS)
require("./models");

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "10kb" }));

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later",
});
app.use(limiter);

/* ================= ROUTES ================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/store", require("./routes/store"));

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    await sequelize.sync();
    console.log("✅ Database synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server start error:", error);
    process.exit(1);
  }
})();