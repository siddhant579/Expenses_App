// const res = await fetch("https://expenses-app-server-one.vercel.app/api/", {

import React, { useState } from "react";

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const TrackerPage = ({ expenses = [], setExpenses }) => {
  const [expenseForms, setExpenseForms] = useState([
    {
      mainCategory: "",
      location: "",
      person: "",
      category: "",
      customCategory: "",
      type: "",
      amount: "",
      receipt: null,
      date: getToday(),
      month: "",
      receiptURL: "",
    },
  ]);

  const [editIndex, setEditIndex] = useState(null);

  const mainCategories = ["Event Based", "Office Based", "Engineering Based"];

  const locationGroups = {
    "Event Based": ["Chaityabhoomi", "Deekshabhoomi"],
    "Office Based": ["Wardha", "Hyderabad"],
    "Engineering Based": ["Hyderabad", "Wardha"],
  };

  const personGroups = {
    Hyderabad: ["Mallesh", "Shignesh", "Rakshit", "Chandu", "Shreyas"],
    Wardha: ["Siddhant", "Mayur", "Apeksha", "Nikhil", "Vaibhav", "Prayag"],
    Chaityabhoomi: [
      "Mallesh",
      "Shignesh",
      "Rakshit",
      "Chandu",
      "Shreyas",
      "Siddhant",
      "Mayur",
      "Apeksha",
      "Nikhil",
      "Vaibhav",
      "Prayag",
    ],
    Deekshabhoomi: [
      "Mallesh",
      "Shignesh",
      "Rakshit",
      "Chandu",
      "Shreyas",
      "Siddhant",
      "Mayur",
      "Apeksha",
      "Nikhil",
      "Vaibhav",
      "Prayag",
    ],
  };

  const commonCategories = [
    "Grocery",
    "Household Work",
    "Computer Repair",
    "D-Mart",
    "Utilities",
    "Products and Services",
    "Salary",
    "Travel and Transport",
    "Internet Recharge",
    "Petrol",
    "Office Rent",
    "Electricity Bill",
    "Sundeep Sir Transfer",
    "Direct Payment",
    "UPI Payment",
    "Others",
  ];

  const autoCreditCategories = [
    "Sundeep Sir Transfer",
    "Direct Payment",
    "UPI Payment",
  ];

  const handleChange = (index, e) => {
    const { name, value, files } = e.target;
    const updated = [...expenseForms];

    if (name === "mainCategory") {
      updated[index] = {
        ...updated[index],
        mainCategory: value,
        location: "",
        person: "",
        category: "",
        type: "",
      };
    } else if (name === "location") {
      updated[index] = {
        ...updated[index],
        location: value,
        person: "",
        category: "",
        type: "",
      };
    } else if (name === "person") {
      updated[index] = { ...updated[index], person: value };
    } else if (name === "category") {
      updated[index].category = value;
      updated[index].customCategory = "";
      updated[index].type = autoCreditCategories.includes(value)
        ? "Credit"
        : "Debit";
    } else if (name === "customCategory") {
      updated[index].customCategory = value;
    } else if (name === "receipt") {
      updated[index][name] = files.length > 0 ? files[0] : null;
      if (files.length > 0) {
        updated[index].receiptURL = URL.createObjectURL(files[0]);
      }
    } else {
      updated[index][name] = value;
    }

    setExpenseForms(updated);
  };

  const addExpenseRow = () => {
    setExpenseForms([
      ...expenseForms,
      {
        mainCategory: "",
        location: "",
        person: "",
        category: "",
        customCategory: "",
        type: "",
        amount: "",
        receipt: null,
        date: getToday(),
        month: "",
        receiptURL: "",
      },
    ]);
  };

  const deleteExpenseRow = (index) => {
    const updated = expenseForms.filter((_, i) => i !== index);
    setExpenseForms(updated);
  };

  const removeReceipt = (index) => {
    const updated = [...expenseForms];
    updated[index].receipt = null;
    updated[index].receiptURL = "";
    setExpenseForms(updated);
  };

  const submitAllExpenses = async () => {
    const validExpenses = [];

    for (let exp of expenseForms) {
      const {
        mainCategory,
        location,
        person,
        category,
        customCategory,
        type,
        amount,
        date,
      } = exp;

      if (
        !mainCategory ||
        !location ||
        !person ||
        !category ||
        !type ||
        !amount ||
        !date
      ) {
        alert("⚠️ Please fill all required fields before submitting.");
        return;
      }

      const parsedAmount = parseFloat(amount);
      const monthStr = new Date(date).toLocaleString("default", {
        month: "long",
      });

      const expenseData = {
        mainCategory,
        location,
        person,
        category: customCategory || category,
        type,
        amount: parsedAmount,
        date,
        month: monthStr,
      };

      try {
        const res = await fetch("https://expenses-app-server-one.vercel.app/api/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData),
        });
        if (!res.ok) throw new Error("Failed to save expense");
      } catch (err) {
        console.error(err);
        alert("❌ Error saving expense to server");
      }

      validExpenses.push(expenseData);
    }

    const currentExpenses = Array.isArray(expenses) ? expenses : [];
    if (editIndex !== null) {
      const updatedExpenses = [...currentExpenses];
      updatedExpenses[editIndex] = validExpenses[0];
      setExpenses(updatedExpenses);
      setEditIndex(null);
    } else {
      setExpenses([...currentExpenses, ...validExpenses]);
    }

    setExpenseForms([
      {
        mainCategory: "",
        location: "",
        person: "",
        category: "",
        customCategory: "",
        type: "",
        amount: "",
        receipt: null,
        date: getToday(),
        month: "",
        receiptURL: "",
      },
    ]);

    alert("✅ Expense added successfully!");
  };

  const resetMonth = () => {
    setExpenses([]);
    alert("🔁 All expenses cleared for this month.");
  };

  return (
    <div className="tracker-container">
      {expenseForms.map((form, idx) => (
        <div className="expense-card" key={idx}>
          <select
            name="mainCategory"
            value={form.mainCategory}
            onChange={(e) => handleChange(idx, e)}
          >
            <option value="">📂 Select Expense Type</option>
            {mainCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {form.mainCategory && (
            <select
              name="location"
              value={form.location}
              onChange={(e) => handleChange(idx, e)}
            >
              <option value="">📍 Select Project / Site</option>
              {locationGroups[form.mainCategory].map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          {form.location && (
            <select
              name="person"
              value={form.person}
              onChange={(e) => handleChange(idx, e)}
            >
              <option value="">👥 Select Team Member</option>
              {personGroups[form.location].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          {form.person && (
            <select
              name="category"
              value={form.category}
              onChange={(e) => handleChange(idx, e)}
            >
              <option value="">💰 Select Expense Category</option>
              {commonCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {(form.category === "Others" ||
            form.category === "Products and Services") && (
            <input
              type="text"
              name="customCategory"
              value={form.customCategory}
              onChange={(e) => handleChange(idx, e)}
              placeholder="Enter custom details..."
            />
          )}

          {form.category && (
            <input
              className={`type-field ${form.type.toLowerCase()}`}
              type="text"
              value={form.type}
              readOnly
            />
          )}

          <input
            name="amount"
            value={form.amount}
            onChange={(e) => handleChange(idx, e)}
            placeholder="Amount (₹)"
            type="number"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={(e) => handleChange(idx, e)}
          />

          <div className="receipt-section">
            {!form.receipt ? (
              <label className="receipt-button">
                🧾 Upload Receipt
                <input
                  type="file"
                  name="receipt"
                  accept="image/*,application/pdf"
                  capture="environment"   // ✅ CAMERA + FILE PICKER
                  onChange={(e) => handleChange(idx, e)}
                  style={{ display: "none" }}
                />
              </label>
            ) : (
              <div className="receipt-preview">
                {form.receipt.type.startsWith("image/") ? (
                  <img
                    src={form.receiptURL}
                    alt="Receipt"
                    width="60"
                    height="60"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span>📄 {form.receipt.name}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeReceipt(idx)}
                  className="delete-receipt-btn"
                >
                  ❌
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => deleteExpenseRow(idx)}
            className="delete-button"
          >
            🗑️ Delete
          </button>
        </div>
      ))}

      <div className="tracker-buttons">
        <button onClick={addExpenseRow}>➕ Add Another</button>
        <button onClick={submitAllExpenses}>✅ Submit All</button>
        <button onClick={resetMonth}>🔁 Reset</button>
      </div>
    </div>
  );
};

export default TrackerPage;
