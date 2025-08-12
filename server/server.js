const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// Sample API route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API working!" });
});

// Export for Vercel
module.exports = app;
