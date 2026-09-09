import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORY_GROUPS,
  CUSTOM_DETAIL_CATEGORIES,
  BOOK_FORM_CATEGORIES,
  namesFor,
} from "../constants/catalog";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://expenses-app-server-one.vercel.app/api";

const emptyForm = () => ({
  mainCategory: "",
  categoryGroup: "",
  category: "",
  customCategory: "",
  note: "",
  type: "",
  amount: "",
  date: "", // 🔥 REMOVED DEFAULT DATE
  month: "",
  // 📚 Book / Frames Order (Offline) fields
  book_customerName: "",
  book_shippingDate: "",
  book_address: "",
  book_amountReceived: "",
  book_shippingCharges: "",
  book_itemNameOption: "",
  book_itemNameCustom: "",
  book_noOfBooks: "",
  book_contactNumber: "",
  book_creditStatusOption: "",
  book_creditStatusCustom: "",
});

const autoCreditCategories = [
  "Sundeep Sir Transfer",
  "Direct Payment",
  "UPI Payment",
];

const TrackerPage = () => {
  const [expenseForms, setExpenseForms] = useState([emptyForm()]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mainCategories = [
    "Hyderabad Office",
    "Wardha Office",
    "Engineering Based",
    "Chaityabhoomi",
    "Deekshabhoomi",
    "Books Publication",
    "Kids Toys",
    "Tshirt",
  ];

  // 📚 Credit Status options for Book orders
  const creditStatusOptions = ["Transfer to Sanghamitra", "Custom"];

  const isBookForm = (category) => BOOK_FORM_CATEGORIES.includes(category);
  const needsCustomDetail = (category) =>
    CUSTOM_DETAIL_CATEGORIES.includes(category);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...expenseForms];

    if (name === "mainCategory") {
      updated[index] = {
        ...updated[index],
        mainCategory: value,
        categoryGroup: "",
        category: "",
        type: "",
      };
    } else if (name === "categoryGroup") {
      updated[index] = {
        ...updated[index],
        categoryGroup: value,
        category: "",
        customCategory: "",
        type: "",
        book_itemNameOption: "",
        book_itemNameCustom: "",
      };
    } else if (name === "category") {
      updated[index].category = value;
      updated[index].customCategory = "";
      updated[index].book_itemNameOption = "";
      updated[index].book_itemNameCustom = "";
      if (isBookForm(value)) {
        // Book / Frames orders: user chooses Credit / Debit manually
        updated[index].type = updated[index].type || "Credit";
      } else {
        updated[index].type = autoCreditCategories.includes(value)
          ? "Credit"
          : "Debit";
      }
    } else if (name === "date") {
      // 🔥 NEW: When date changes, auto-calculate month
      updated[index].date = value;
      if (value) {
        const dateObj = new Date(value);
        updated[index].month = dateObj.toLocaleString("default", {
          month: "long",
          year: "numeric",
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
    setExpenseForms([...expenseForms, emptyForm()]);
  };

  const deleteExpenseRow = (index) => {
    if (expenseForms.length === 1) {
      setExpenseForms([emptyForm()]);
    } else {
      setExpenseForms(expenseForms.filter((_, i) => i !== index));
    }
  };

  const resolveCreditStatus = (form) => {
    if (form.book_creditStatusOption === "Custom") {
      return form.book_creditStatusCustom.trim();
    }
    return form.book_creditStatusOption;
  };

  const resolveItemName = (form) => {
    if (form.book_itemNameOption === "Other") {
      return form.book_itemNameCustom.trim();
    }
    return form.book_itemNameOption;
  };

  const submitAllExpenses = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/login");
        return;
      }

      for (let exp of expenseForms) {
        // ================================
        // 📚 BOOK / FRAMES ORDER branch
        // ================================
        if (isBookForm(exp.category)) {
          const itemName = resolveItemName(exp);

          if (
            !exp.mainCategory ||
            !exp.book_customerName ||
            !itemName ||
            !exp.date ||
            !exp.type
          ) {
            alert(
              `⚠️ ${exp.category} order: please fill Expense Type, Date, Customer Name, ${exp.category} Name and Credit/Debit before submitting.`
            );
            setLoading(false);
            return;
          }

          const creditStatus = resolveCreditStatus(exp);
          if (exp.book_creditStatusOption === "Custom" && !creditStatus) {
            alert("⚠️ Please enter a custom Credit Status name.");
            setLoading(false);
            return;
          }

          const bookPayload = {
            mainCategory: exp.mainCategory,
            itemType: exp.category, // "Book" or "Frames"
            customerName: exp.book_customerName,
            shippingDate: exp.book_shippingDate || null,
            address: exp.book_address,
            amountReceived: parseFloat(exp.book_amountReceived) || 0,
            shippingCharges: parseFloat(exp.book_shippingCharges) || 0,
            bookName: itemName,
            noOfBooks: parseInt(exp.book_noOfBooks, 10) || 0,
            contactNumber: exp.book_contactNumber,
            creditStatus,
            type: exp.type,
            note: exp.note,
          };

          const res = await fetch(`${API_URL}/book-orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookPayload),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to save order");
          }

          continue;
        }

        // ================================
        // 💸 REGULAR EXPENSE branch
        // ================================
        const {
          mainCategory,
          category,
          customCategory,
          note,
          type,
          amount,
          date,
          month,
        } = exp;

        if (!mainCategory || !category || !type || !amount || !date) {
          alert(
            "⚠️ Please fill all required fields (including date) before submitting."
          );
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
          month,
        };

        const res = await fetch(`${API_URL}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(expenseData),
        });

        if (!res.ok) {
          let errorMessage = "Failed to save expense";
          try {
            errorMessage = await res.text();
          } catch (e) {
            /* ignore */
          }
          throw new Error(errorMessage);
        }
      }

      setExpenseForms([emptyForm()]);
      alert("✅ Submitted successfully! View it on the Transactions page.");
    } catch (err) {
      console.error("Error submitting:", err);
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
            {/* Date + Expense Type */}
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
                    padding: "10px",
                    fontSize: "14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "6px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
                {form.month && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
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
                  {mainCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expense Section → Expense Category (cascading dropdowns) */}
            <div className="form-row">
              {form.mainCategory && (
                <div className="form-group">
                  <label>Expense Section *</label>
                  <select
                    name="categoryGroup"
                    value={form.categoryGroup}
                    onChange={(e) => handleChange(idx, e)}
                    required
                  >
                    <option value="">Select Section</option>
                    {CATEGORY_GROUPS.map((group) => (
                      <option key={group.label} value={group.label}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.categoryGroup && (
                <div className="form-group">
                  <label>Expense Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => handleChange(idx, e)}
                    required
                  >
                    <option value="">Select Expense Category</option>
                    {(
                      CATEGORY_GROUPS.find(
                        (g) => g.label === form.categoryGroup
                      )?.options || []
                    ).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-row">
              {needsCustomDetail(form.category) && (
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

            {/* ================================================= */}
            {/* 📚 BOOK / FRAMES ORDER (Offline) SECTION            */}
            {/* ================================================= */}
            {isBookForm(form.category) && (
              <div
                style={{
                  border: "2px solid #b8f2e6",
                  borderRadius: "10px",
                  padding: "1rem",
                  marginTop: "0.8rem",
                  background: "#f7fffd",
                }}
              >
                <h4 style={{ marginTop: 0 }}>
                  {form.category === "Frames" ? "🖼️" : "📚"}{" "}
                  {form.category} Order
                </h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      name="book_customerName"
                      value={form.book_customerName}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="e.g. Shivam"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shipping Date</label>
                    <input
                      type="date"
                      name="book_shippingDate"
                      value={form.book_shippingDate}
                      onChange={(e) => handleChange(idx, e)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="book_address"
                      value={form.book_address}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="Full delivery address..."
                      rows="2"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount Received (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="book_amountReceived"
                      value={form.book_amountReceived}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shipping Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="book_shippingCharges"
                      value={form.book_shippingCharges}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{form.category} Name *</label>
                    <select
                      name="book_itemNameOption"
                      value={form.book_itemNameOption}
                      onChange={(e) => handleChange(idx, e)}
                    >
                      <option value="">Select {form.category} Name</option>
                      {namesFor(form.category).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>No of {form.category === "Frames" ? "Frames" : "Books"}</label>
                    <input
                      type="number"
                      min="0"
                      name="book_noOfBooks"
                      value={form.book_noOfBooks}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {form.book_itemNameOption === "Other" && (
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Custom {form.category} Name *</label>
                      <input
                        type="text"
                        name="book_itemNameCustom"
                        value={form.book_itemNameCustom}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder={`Enter ${form.category.toLowerCase()} name...`}
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      name="book_contactNumber"
                      value={form.book_contactNumber}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="10-digit number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Credit Status</label>
                    <select
                      name="book_creditStatusOption"
                      value={form.book_creditStatusOption}
                      onChange={(e) => handleChange(idx, e)}
                    >
                      <option value="">Select Credit Status</option>
                      {creditStatusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.book_creditStatusOption === "Custom" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Custom Credit Status *</label>
                      <input
                        type="text"
                        name="book_creditStatusCustom"
                        value={form.book_creditStatusCustom}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Enter name / status..."
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Credit / Debit *</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={(e) => handleChange(idx, e)}
                    >
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* 💸 REGULAR EXPENSE AMOUNT SECTION                   */}
            {/* ================================================= */}
            {form.category && !isBookForm(form.category) && (
              <div className="form-row">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <input
                    className={`type-field ${form.type.toLowerCase()}`}
                    type="text"
                    value={form.type}
                    readOnly
                  />
                </div>

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
              </div>
            )}

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

      <div className="form-info">
        <p>
          <strong>Note:</strong> All fields marked with * are required. Please
          enter the actual expense date.
        </p>
      </div>
    </div>
  );
};

export default TrackerPage;
