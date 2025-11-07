import React, { useState } from "react";
const TrackerPage = ({ expenses, setExpenses, accountBalance, setAccountBalance }) => {
  const [initial, setInitial] = useState("");
  const [expenseForms, setExpenseForms] = useState([
    { mainCategory: "", category: "", type: "Debit", amount: "", receipt: null, date: "", month: "", receiptURL: "" }
  ]);
  const [editIndex, setEditIndex] = useState(null);

  // 🔹 Main + Sub Category structure
  const categoryGroups = {
    Hyderabad: [
      "Grocery",
      "Household Work",
      "Computer Repair",
      "D-Mart",
      "Utilities",
      "Direct Payment",
      "UPI Payment",
      "Others",
    ],
    Wardha: [
      "Products and Services",
      "Salary",
      "Travel and Transport",
      "Internet Recharge",
      "Petrol",
      "Office Rent",
      "Electricity Bill",
      "Others",
    ],
    Engineering: [
      "Mechanical Components",
      "Electronic",
      "Drivers",
      "Raw Material",
      "Tools",
      "Workshop Items",
      "Prototyping and Fabrication Material",
      "Robotics",
      "Others",
    ],
  };

  const creditCategories = ["Direct Payment", "UPI Payment", "Salary"];

  // ====== Initial Balance ======
  if (accountBalance === null) {
    const confirmInitialBalance = () => {
      const amount = parseFloat(initial);
      if (!isNaN(amount) && amount >= 0) {
        setAccountBalance(amount);
      } else {
        alert("Please enter a valid starting balance.");
      }
    };
    return (
      <div className="form">
        <h2>Enter Starting Balance</h2>
        <input
          type="number"
          value={initial}
          onChange={(e) => setInitial(e.target.value)}
          placeholder="Enter starting ₹ amount"
        />
        <button onClick={confirmInitialBalance}>Set Balance</button>
      </div>
    );
  }

  // ====== Handle Input Change ======
  const handleChange = (index, e) => {
    const { name, value, files } = e.target;
    const updated = [...expenseForms];

    if (name === "mainCategory") {
      updated[index].mainCategory = value;
      updated[index].category = ""; // reset subcategory on change
    } else if (name === "category") {
      updated[index].category = value;
      updated[index].type = creditCategories.includes(value) ? "Credit" : "Debit";
    } else if (name === "receipt") {
      updated[index][name] = files.length > 0 ? files[0] : null;
    } else {
      updated[index][name] = value;
    }
    setExpenseForms(updated);
  };

  const addExpenseRow = () => {
    setExpenseForms([
      ...expenseForms,
      { mainCategory: "", category: "", type: "Debit", amount: "", receipt: null, date: "", month: "", receiptURL: "" }
    ]);
  };

  const submitAllExpenses = async () => {
    const validExpenses = [];
    for (let exp of expenseForms) {
      const { mainCategory, category, type, amount, receipt, date } = exp;
      if (!mainCategory || !category || !amount || !type || !date) {
        alert("Please fill all required fields.");
        return;
      }

      const parsedAmount = parseFloat(amount);
      const updatedBalance =
        type === "Debit" ? accountBalance - parsedAmount : accountBalance + parsedAmount;

      const monthStr = new Date(date).toLocaleString("default", { month: "long" });

      const expenseData = {
        mainCategory,
        category,
        type,
        amount: parsedAmount,
        date,
        month: monthStr,
        receiptURL: receipt ? URL.createObjectURL(receipt) : ""
      };

      // Send to backend
      try {
        const res = await fetch("https://expenses-app-server-one.vercel.app/api/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData)
        });
        if (!res.ok) throw new Error("Failed to save expense");
      } catch (err) {
        console.error(err);
        alert("Error saving expense to server");
      }

      validExpenses.push(expenseData);
      setAccountBalance(updatedBalance);
    }

    if (editIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editIndex] = validExpenses[0];
      setExpenses(updatedExpenses);
      setEditIndex(null);
    } else {
      setExpenses([...expenses, ...validExpenses]);
    }

    setExpenseForms([{ mainCategory: "", category: "", type: "Debit", amount: "", receipt: null, date: "", month: "", receiptURL: "" }]);
    alert("Expenses submitted successfully! ✅\n👉 Check Transactions page to view them.");
  };

  const resetMonth = () => {
    setExpenses([]);
    alert("All expenses have been cleared for the month.");
  };

  return (
    <div>
      {expenseForms.map((form, idx) => (
        <div className="form" key={idx} style={{ marginBottom: "1.5rem" }}>
          {/* Main Category Dropdown */}
          <select name="mainCategory" value={form.mainCategory} onChange={(e) => handleChange(idx, e)}>
            <option value="">Select Main Category</option>
            {Object.keys(categoryGroups).map((main) => (
              <option key={main} value={main}>{main}</option>
            ))}
          </select>

          {/* Sub Category Dropdown */}
          {form.mainCategory && (
            <select name="category" value={form.category} onChange={(e) => handleChange(idx, e)}>
              <option value="">Select Sub Category</option>
              {categoryGroups[form.mainCategory].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            value={form.type}
            readOnly
            style={{
              backgroundColor: form.type === "Credit" ? "#d4edda" : "#f8d7da",
              color: form.type === "Credit" ? "green" : "red",
              fontWeight: "bold",
              width: "100px",
              textAlign: "center"
            }}
          />

          <input name="amount" value={form.amount} onChange={(e) => handleChange(idx, e)} placeholder="Amount (₹)" type="number" />
          <input type="date" name="date" value={form.date} onChange={(e) => handleChange(idx, e)} />
          <input name="receipt" onChange={(e) => handleChange(idx, e)} type="file" accept="image/*" />
          <small style={{ display: "block" }}>Receipt (Optional)</small>
        </div>
      ))}

      <button onClick={addExpenseRow}>➕ Add Another</button>
      <button onClick={submitAllExpenses} style={{ marginLeft: "1rem" }}>
        {editIndex !== null ? "💾 Save Changes" : "✅ Submit All"}
      </button>

      <h2 style={{ marginTop: "2rem" }}>💼 Current Balance: ₹{accountBalance}</h2>
      <button onClick={resetMonth} style={{ marginTop: "1rem" }}>🔁 Reset Month</button>
    </div>
  );
};

export default TrackerPage;
