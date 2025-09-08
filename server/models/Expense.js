const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    mainCategory: {
      type: String,
      required: true,
      enum: ["Hyderabad", "Wardha", "Engineering"],
    },
    category: {
      type: String,
      required: true,
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
      required: true,
    },
    receiptURL: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
