// routes/expenses.js
const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/organization");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

// 🔐 POST - Add expense (Protected - requires authentication)
router.post("/expenses", verifyToken, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      organizationId: req.user.organizationId,
      userId: req.user._id,
    });
    
    await expense.save();
    
    // Populate user info for response
    await expense.populate('userId', 'name email');
    
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔐 GET - All expenses for organization (Protected)
router.get("/expenses", verifyToken, async (req, res) => {
  try {
    // Admin sees all expenses in organization
    // Employee sees only their own expenses
    const filter = {
      organizationId: req.user.organizationId
    };
    
    if (req.user.role === 'employee') {
      filter.userId = req.user._id;
    }
    
    const expenses = await Expense.find(filter)
      .populate('userId', 'name email role')
      .sort({ date: -1 });
      
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 GET - Expense statistics for admin dashboard
router.get("/expenses/stats", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const organizationId = req.user.organizationId;

    // Get all expenses for the organization
    const expenses = await Expense.find({ organizationId })
      .populate('userId', 'name email');

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Group by employee
    const employeeStats = {};
    expenses.forEach(expense => {
      const userId = expense.userId._id.toString();
      const userName = expense.userId.name;
      
      if (!employeeStats[userId]) {
        employeeStats[userId] = {
          userId,
          userName,
          email: expense.userId.email,
          totalExpenses: 0,
          expenseCount: 0,
          expenses: []
        };
      }
      
      employeeStats[userId].totalExpenses += expense.amount;
      employeeStats[userId].expenseCount += 1;
      employeeStats[userId].expenses.push(expense);
    });

    // Group by category
    const categoryStats = {};
    expenses.forEach(expense => {
      const category = expense.category;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          total: 0,
          count: 0
        };
      }
      categoryStats[category].total += expense.amount;
      categoryStats[category].count += 1;
    });

    res.json({
      totalExpenses,
      expenseCount: expenses.length,
      employees: Object.values(employeeStats),
      categories: Object.values(categoryStats),
      recentExpenses: expenses.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 GET - List all employees in organization (Admin only)
router.get("/employees", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const employees = await User.find({
      organizationId: req.user.organizationId,
      role: 'employee'
    }).select('-password');

    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 GET - Employee details with expenses (Admin only)
router.get("/employees/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const employee = await User.findOne({
      _id: req.params.userId,
      organizationId: req.user.organizationId
    }).select('-password');

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const expenses = await Expense.find({
      userId: req.params.userId,
      organizationId: req.user.organizationId
    }).sort({ date: -1 });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      employee,
      expenses,
      totalExpenses,
      expenseCount: expenses.length
    });
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

router.post("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    res.json({ 
      message: "Email verified successfully",
      exists: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Reset Password (without code verification)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
