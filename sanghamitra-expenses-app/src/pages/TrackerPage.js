import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TrackerPage = () => {
  const [expenseForms, setExpenseForms] = useState([
    {
      mainCategory: "",
      category: "",
      customCategory: "",
      note: "",
      type: "",
      amount: "",
      date: "", // 🔥 REMOVED DEFAULT DATE
      month: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [submittedExpenses, setSubmittedExpenses] = useState([]);
  const navigate = useNavigate();

  // Static categories data
  const categories = {
    mainCategories: ["Hyderabad Office", "Wardha Office", "Engineering Based", "Chaityabhoomi", "Deekshabhoomi", "Books Publication", "Kids Toys", "Tshirt"],
    expenseCategories: [
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
      "Others"
    ]
  };

  const autoCreditCategories = [
    "Sundeep Sir Transfer",
    "Direct Payment",
    "UPI Payment",
  ];

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...expenseForms];

    if (name === "mainCategory") {
      updated[index] = {
        ...updated[index],
        mainCategory: value,
        category: "",
        type: "",
      };
    } else if (name === "category") {
      updated[index].category = value;
      updated[index].customCategory = "";
      updated[index].type = autoCreditCategories.includes(value)
        ? "Credit"
        : "Debit";
    } else if (name === "date") {
      // 🔥 NEW: When date changes, auto-calculate month
      updated[index].date = value;
      if (value) {
        const dateObj = new Date(value);
        updated[index].month = dateObj.toLocaleString("default", { 
          month: "long", 
          year: 'numeric' 
        });
      } else {
        updated[index].month = "";
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
        category: "",
        customCategory: "",
        note: "",
        type: "",
        amount: "",
        date: "", // 🔥 EMPTY DATE
        month: "",
      },
    ]);
  };

  const deleteExpenseRow = (index) => {
    if (expenseForms.length === 1) {
      // If it's the last row, just reset it
      setExpenseForms([
        {
          mainCategory: "",
          category: "",
          customCategory: "",
          note: "",
          type: "",
          amount: "",
          date: "",
          month: "",
        },
      ]);
    } else {
      const updated = expenseForms.filter((_, i) => i !== index);
      setExpenseForms(updated);
    }
  };

  const submitAllExpenses = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login again");
        navigate('/login');
        return;
      }

      const submittedData = [];

      for (let exp of expenseForms) {
        const {
          mainCategory,
          category,
          customCategory,
          note,
          type,
          amount,
          date,
          month
        } = exp;

        // 🔥 ENHANCED VALIDATION - Now includes date
        if (!mainCategory || !category || !type || !amount || !date) {
          alert("⚠️ Please fill all required fields (including date) before submitting.");
          setLoading(false);
          return;
        }

        const parsedAmount = parseFloat(amount);

        const expenseData = {
          mainCategory,
          location: mainCategory,
          category: customCategory || category,
          note,
          type,
          amount: parsedAmount,
          date,
          month
        };

        console.log("Submitting expense:", expenseData);

        // Save expense to backend
        const res = await fetch("https://expenses-app-server-one.vercel.app/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(expenseData),
        });
        
        if (!res.ok) {
          let errorMessage = "Failed to save expense";
          try {
            const errorData = await res.text();
            console.error("Server response:", errorData);
            errorMessage = errorData;
          } catch (e) {
            console.error("Could not parse error response");
          }
          throw new Error(errorMessage);
        }

        let savedExpense;
        try {
          savedExpense = await res.json();
          submittedData.push(savedExpense);
        } catch (e) {
          console.error("Error parsing response JSON:", e);
          submittedData.push(expenseData);
        }
      }

      // Add to submitted expenses table
      setSubmittedExpenses(prev => [...prev, ...submittedData]);

      // Reset forms after successful submission
      setExpenseForms([
        {
          mainCategory: "",
          category: "",
          customCategory: "",
          note: "",
          type: "",
          amount: "",
          date: "",
          month: "",
        },
      ]);

      alert("✅ Expenses submitted successfully!");
      
    } catch (err) {
      console.error("Error submitting expenses:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracker-container">
      <div className="page-header">
        <h1>💰 Expense Tracker</h1>
        <p>Record your daily expenses here</p>
      </div>

      {/* Expense Form Section */}
      <div className="form-section">
        <h3>Add New Expense</h3>
        {expenseForms.map((form, idx) => (
          <div className="expense-card" key={idx}>
            {/* 🔥 NEW: Date Input Row at the top */}
            <div className="form-row">
              <div className="form-group">
                <label>Expense Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={(e) => handleChange(idx, e)}
                  required
                  style={{
                    padding: '10px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {form.month && (
                  <small style={{ 
                    display: 'block', 
                    marginTop: '5px', 
                    color: '#6b7280',
                    fontSize: '12px'
                  }}>
                    📅 Month: {form.month}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Expense Type *</label>
                <select
                  name="mainCategory"
                  value={form.mainCategory}
                  onChange={(e) => handleChange(idx, e)}
                  required
                >
                  <option value="">Select Expense Type</option>
                  {categories.mainCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              {form.mainCategory && (
                <div className="form-group">
                  <label>Expense Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => handleChange(idx, e)}
                    required
                  >
                    <option value="">Select Expense Category</option>
                    {categories.expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(form.category === "Others" || form.category === "Products and Services") && (
                <div className="form-group">
                  <label>Custom Details</label>
                  <input
                    type="text"
                    name="customCategory"
                    value={form.customCategory}
                    onChange={(e) => handleChange(idx, e)}
                    placeholder="Enter custom details..."
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              {form.category && (
                <div className="form-group">
                  <label>Transaction Type</label>
                  <input
                    className={`type-field ${form.type.toLowerCase()}`}
                    type="text"
                    value={form.type}
                    readOnly
                  />
                </div>
              )}

              {form.category && (
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={(e) => handleChange(idx, e)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Note (Optional)</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>
            </div>

            {expenseForms.length > 1 && (
              <button
                type="button"
                onClick={() => deleteExpenseRow(idx)}
                className="delete-button"
              >
                🗑️ Delete This Row
              </button>
            )}
          </div>
        ))}

        <div className="form-buttons">
          <button onClick={addExpenseRow} disabled={loading}>
            ➕ Add Another Expense
          </button>
          <button 
            onClick={submitAllExpenses} 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "⏳ Submitting..." : "✅ Submit All Expenses"}
          </button>
        </div>
      </div>

      {/* Submitted Expenses Table */}
      {submittedExpenses.length > 0 && (
        <div className="table-section">
          <h3>Recently Submitted Expenses</h3>
          <div className="expenses-table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Month</th>
                  <th>Expense Type</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {submittedExpenses.map((expense, index) => (
                  <tr key={index}>
                    <td>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                    <td>{expense.month}</td>
                    <td>{expense.mainCategory}</td>
                    <td>{expense.category}</td>
                    <td>
                      <span className={`type-badge ${expense.type.toLowerCase()}`}>
                        {expense.type}
                      </span>
                    </td>
                    <td>₹{expense.amount}</td>
                    <td>{expense.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="form-info">
        <p><strong>Note:</strong> All fields marked with * are required. Please enter the actual expense date.</p>
      </div>
    </div>
  );
};

export default TrackerPage;
