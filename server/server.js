// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expensesRoutes = require("./routes/expenseRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "https://sanghamitra-expenses-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"], // optional: allowed methods
  credentials: true // optional: if you need cookies/auth headers
}));
app.use(express.json());

// Routes
app.use("/api/expenses", expensesRoutes);

// Test route to check server connection
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Server is running fine!" });
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// Export for Vercelss
module.exports = app;
