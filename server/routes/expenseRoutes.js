// routes/expenses.js
const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const User = require("../models/User");

// POST - Add expense
router.post("/", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET - All expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧾 Admin Registration (creates organization)
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Generate unique code for organization
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const org = await Organization.create({ name: organizationName, code });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      organizationId: org._id,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      organizationCode: code,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👨‍💼 Employee Registration (joins existing org via code)
router.post("/register-employee", async (req, res) => {
  try {
    const { name, email, password, organizationCode } = req.body;

    const org = await Organization.findOne({ code: organizationCode });
    if (!org) return res.status(404).json({ message: "Invalid organization code" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
      organizationId: org._id,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Employee registered successfully",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 Login Route (for both admin & employee)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("organizationId");
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
