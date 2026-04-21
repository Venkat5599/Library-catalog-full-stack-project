const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

/* =========================
   🔐 Security Middleware
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

/* =========================
   🌐 CORS Configuration
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-vercel-app.vercel.app" // 🔁 replace after deploy
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true
  })
);

/* =========================
   🚦 Rate Limiting
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { message: "Too many requests, try again later." }
});

app.use("/api/", limiter);

/* =========================
   📦 Body Parsing
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   📊 Logging
========================= */
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/* =========================
   📁 Static Uploads
========================= */
app.use("/uploads", express.static("uploads"));

/* =========================
   🗄️ MongoDB Connection
========================= */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

/* =========================
   📡 Routes
========================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/borrows", require("./routes/borrows"));
app.use("/api/users", require("./routes/users"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reviews", require("./routes/reviews"));

/* =========================
   ❤️ Health Check
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Library API running 🚀"
  });
});

/* =========================
   ❌ 404 Handler
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =========================
   ⚠️ Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

/* =========================
   🚀 Start Server
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});