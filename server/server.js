// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expensesRoutes = require("./routes/expenseRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://expenses-app-frontend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ], // allow production frontend and local dev
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // allow cookies or auth headers
  })
);

app.use(express.json());

// ---------------------------------------------------------------
// 🔌 MongoDB connection — cached so it survives across serverless
//    (Vercel) invocations and is retried if it ever fails.
// ---------------------------------------------------------------
let dbPromise = null;

function connectDB() {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!dbPromise) {
    if (!process.env.MONGO_URI) {
      return Promise.reject(new Error("MONGO_URI environment variable is not set"));
    }

    dbPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000, // fail fast with a clear error
      })
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        dbPromise = null; // allow a retry on the next request
        console.error("❌ Mongo error:", err.message);
        throw err;
      });
  }

  return dbPromise;
}

// Make sure the DB is reachable before handling any API request.
// Returns a readable JSON error instead of an empty 500 if it isn't.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      error: "Database connection failed",
      message: err.message,
      hint:
        "Check that MONGO_URI is set on the server and that MongoDB Atlas " +
        "Network Access allows 0.0.0.0/0 (Vercel's IPs are dynamic).",
    });
  }
});

// Test route to check server connection
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running fine!" });
});

// Routes
app.use("/api", expensesRoutes);

// Start server locally (Vercel imports `app` directly and doesn't run this)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().catch(() => {});
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Export for Vercel
module.exports = app;
