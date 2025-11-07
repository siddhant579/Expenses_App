import React, { useState } from "react";

const TransactionsPage = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const monthsList = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const yearOptions = ["2020","2021","2022","2023","2024","2025"];

  // ✅ Filter expenses (using props, no fetching here)
  const filtered = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const monthMatch =
      selectedMonth === "All" ||
      expenseDate.toLocaleString("default", { month: "long" }) === selectedMonth;
    const yearMatch =
      selectedYear === "All" ||
      expenseDate.getFullYear().toString() === selectedYear;
    return monthMatch && yearMatch;
  });

  const getTotal = (type) =>
    filtered.filter((e) => e.type === type).reduce((sum, e) => sum + e.amount, 0);

  const getTotalByCategory = () => {
    const totals = {};
    filtered.forEach((expense) => {
      const key = `${expense.category}-${expense.type}`;
      if (!totals[key]) totals[key] = 0;
      totals[key] += expense.amount;
    });
    return totals;
  };

  const categoryTotals = getTotalByCategory();

  return (
    <div>
      <h1>Transactions</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <label htmlFor="month">📅 Month:</label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All</option>
          {monthsList.map((month, i) => (
            <option key={i} value={month}>{month}</option>
          ))}
        </select>

        <label htmlFor="year">🗓️ Year:</label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <h2>Summary for: {selectedMonth} {selectedYear}</h2>
      <p>🟢 Total Credited: ₹{getTotal("Credit")}</p>
      <p>🔴 Total Debited: ₹{getTotal("Debit")}</p>

      {/* Category Totals */}
      <h3>Category Totals</h3>
      <ul>
        {Object.entries(categoryTotals).map(([key, val]) => (
          <li key={key}>{key.replace("-", " ➝ ")}: ₹{val}</li>
        ))}
      </ul>

      {/* Transactions Table */}
      <h3>All Transactions</h3>
      {filtered.length === 0 ? (
        <p>No transactions found for this filter.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i}>
                <td style={tdStyle}>{new Date(e.date).toLocaleDateString()}</td>
                <td style={tdStyle}>{e.category}</td>
                <td style={tdStyle}>{e.type}</td>
                <td style={tdStyle}>₹{e.amount}</td>
                <td style={tdStyle}>
                  {e.receiptURL ? (
                    <a href={e.receiptURL} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    "No Receipt"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Table styles
const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default TransactionsPage;
