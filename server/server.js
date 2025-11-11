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
    origin: "https://expenses-app-frontend.vercel.app", // allow only your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // allow cookies or auth headers
  })
);

app.use(express.json());

// Test route to check server connection
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running fine!" });
});

// Routes
app.use("/api", expensesRoutes);


// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// Export for Vercelss
module.exports = app;
