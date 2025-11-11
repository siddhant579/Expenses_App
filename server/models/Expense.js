const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    mainCategory: {
      type: String,
      required: true, // Event Based / Office Based / Engineering Based
    },
    location: {
      type: String,
      required: true, // Chaibhumi / Wardha / Hyderabad / etc.
    },
    person: {
      type: String,
      required: true, // Siddhant / Mallesh / etc.
    },
    category: {
      type: String,
      required: true, // Grocery / Rent / Others / etc.
    },
    customCategory: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    month: {
      type: String,
      required: true, // October / November etc.
    },
    receiptURL: {
      type: String,
      default: "",
    },

    // 🧩 Multi-Tenancy Fields
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true, // speeds up tenant-based queries
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
