const mongoose = require("mongoose");

const bookOrderSchema = new mongoose.Schema(
  {
    // 🔗 Linked expense context (which main category this was logged under)
    mainCategory: {
      type: String,
      default: "Books Publication",
    },

    // Whether this offline order is for a Book or a Frame
    itemType: {
      type: String,
      enum: ["Book", "Frames"],
      default: "Book",
    },

    // 📋 Fields from the "Books Order (Offline)" sheet
    customerName: {
      type: String,
      required: true,
    },
    shippingDate: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookName: {
      type: String,
      default: "",
    },
    noOfBooks: {
      type: Number,
      default: 0,
      min: 0,
    },
    contactNumber: {
      type: String,
      default: "",
    },
    // "To <username>" / "Transfer to Sanghamitra" / any custom text
    creditStatus: {
      type: String,
      default: "",
    },

    // 💰 Credit / Debit tracking
    type: {
      type: String,
      enum: ["Credit", "Debit"],
      default: "Credit",
    },
    note: {
      type: String,
      default: "",
    },

    // 🧩 Multi-Tenancy Fields
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BookOrder", bookOrderSchema);
