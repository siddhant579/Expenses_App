import React, { useState } from "react";
import { Camera, Upload, X, CheckCircle } from "lucide-react";

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const TrackerPage = ({ expenses = [], setExpenses }) => {
  const [expenseForms, setExpenseForms] = useState([
    {
      mainCategory: "",
      location: "",
      category: "",
      customCategory: "",
      type: "",
      amount: "",
      receipt: null,
      date: getToday(),
      receiptURL: "",
    },
  ]);

  const mainCategories = ["Event Based", "Office Based", "Engineering Based"];

  const locationGroups = {
    "Event Based": ["Chaityabhoomi", "Deekshabhoomi"],
    "Office Based": ["Wardha", "Hyderabad"],
    "Engineering Based": ["Hyderabad", "Wardha"],
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
        category: "",
        type: "",
      };
    } else if (name === "location") {
      updated[index] = {
        ...updated[index],
        location: value,
        category: "",
        type: "",
      };
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
        category: "",
        customCategory: "",
        type: "",
        amount: "",
        receipt: null,
        date: getToday(),
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
        category,
        customCategory,
        type,
        amount,
        date,
      } = exp;

      if (
        !mainCategory ||
        !location ||
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
        return;
      }

      validExpenses.push(expenseData);
    }

    const currentExpenses = Array.isArray(expenses) ? expenses : [];
    setExpenses([...currentExpenses, ...validExpenses]);

    setExpenseForms([
      {
        mainCategory: "",
        location: "",
        category: "",
        customCategory: "",
        type: "",
        amount: "",
        receipt: null,
        date: getToday(),
        receiptURL: "",
      },
    ]);

    alert("✅ Expense added successfully!");
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {expenseForms.map((form, idx) => (
            <div className="card shadow-sm mb-4 border-0" key={idx}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 text-primary">
                    <span className="badge bg-primary me-2">{idx + 1}</span>
                    Expense Entry
                  </h5>
                  {expenseForms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteExpenseRow(idx)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <X size={16} className="me-1" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="row g-3">
                  {/* Main Category */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <span className="text-danger me-1">*</span>
                      Expense Type
                    </label>
                    <select
                      name="mainCategory"
                      value={form.mainCategory}
                      onChange={(e) => handleChange(idx, e)}
                      className="form-select"
                    >
                      <option value="">Select Type...</option>
                      {mainCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  {form.mainCategory && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="text-danger me-1">*</span>
                        Project / Site
                      </label>
                      <select
                        name="location"
                        value={form.location}
                        onChange={(e) => handleChange(idx, e)}
                        className="form-select"
                      >
                        <option value="">Select Location...</option>
                        {locationGroups[form.mainCategory].map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Category */}
                  {form.location && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <span className="text-danger me-1">*</span>
                        Expense Category
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={(e) => handleChange(idx, e)}
                        className="form-select"
                      >
                        <option value="">Select Category...</option>
                        {commonCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Custom Category */}
                  {(form.category === "Others" ||
                    form.category === "Products and Services") && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Custom Details
                      </label>
                      <input
                        type="text"
                        name="customCategory"
                        value={form.customCategory}
                        onChange={(e) => handleChange(idx, e)}
                        placeholder="Enter details..."
                        className="form-control"
                      />
                    </div>
                  )}

                  {/* Type */}
                  {form.category && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Type</label>
                      <input
                        className={`form-control fw-bold ${
                          form.type === "Credit"
                            ? "text-success bg-success bg-opacity-10"
                            : "text-danger bg-danger bg-opacity-10"
                        }`}
                        type="text"
                        value={form.type}
                        readOnly
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <span className="text-danger me-1">*</span>
                      Amount (₹)
                    </label>
                    <input
                      name="amount"
                      value={form.amount}
                      onChange={(e) => handleChange(idx, e)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="form-control"
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Upload Receipt (Optional)
                    </label>
                    
                    {!form.receipt ? (
                      <div className="d-flex gap-2">
                        <label className="btn btn-outline-primary flex-grow-1">
                          <Camera size={18} className="me-2" />
                          Take Photo
                          <input
                            type="file"
                            name="receipt"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleChange(idx, e)}
                            style={{ display: "none" }}
                          />
                        </label>
                        <label className="btn btn-outline-secondary flex-grow-1">
                          <Upload size={18} className="me-2" />
                          Choose File
                          <input
                            type="file"
                            name="receipt"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleChange(idx, e)}
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="card bg-light">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center gap-3">
                            {form.receipt.type.startsWith("image/") ? (
                              <img
                                src={form.receiptURL}
                                alt="Receipt"
                                className="rounded"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  border: "2px solid #dee2e6",
                                }}
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center rounded bg-white"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  border: "2px solid #dee2e6",
                                }}
                              >
                                <span className="fs-1">📄</span>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-semibold text-truncate">
                                {form.receipt.name}
                              </p>
                              <p className="mb-0 text-muted small">
                                {(form.receipt.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeReceipt(idx)}
                              className="btn btn-danger btn-sm"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="d-flex gap-3 justify-content-center mb-4">
            <button
              onClick={addExpenseRow}
              className="btn btn-outline-primary px-4"
            >
              ➕ Add Another Entry
            </button>
            <button
              onClick={submitAllExpenses}
              className="btn btn-success px-5 fw-semibold"
            >
              <CheckCircle size={18} className="me-2" />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;
