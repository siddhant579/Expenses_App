import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const TransactionsPage = ({ expenses = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [sortOrder, setSortOrder] = useState("Descending"); // 🔹 Sort state

  const monthsList = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const yearOptions = ["2023","2024","2025","2026","2027"];

  // 🔹 Filter logic
  const calculateTotalsFor = (month, year) => {
    const filtered = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const monthMatch =
        month === "All" ||
        expenseDate.toLocaleString("default", { month: "long" }) === month;
      const yearMatch =
        year === "All" || expenseDate.getFullYear().toString() === year;
      return monthMatch && yearMatch;
    });

    const credit = filtered
      .filter((e) => e.type === "Credit")
      .reduce((sum, e) => sum + e.amount, 0);

    const debit = filtered
      .filter((e) => e.type === "Debit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { credit, debit, net: credit - debit, list: filtered };
  };

  const { credit, debit, net, list: filteredUnsorted } = calculateTotalsFor(selectedMonth, selectedYear);
  const formatCurrency = (num) => "₹" + (num || 0).toLocaleString("en-IN");

  // 🔹 Sorting
  const filtered = [...filteredUnsorted].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "Ascending" ? dateA - dateB : dateB - dateA;
  });

  // ✅ Chart data
  const pieData = [
    { name: "Credit", value: credit },
    { name: "Debit", value: debit },
  ];
  const COLORS = ["#00C49F", "#FF4C4C"];

  const monthlyData = monthsList.map((month) => {
    const { credit, debit } = calculateTotalsFor(month, selectedYear);
    return { month, Credit: credit, Debit: debit };
  });

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* 🔹 Filters, Summary & Charts Section */}
      <div
        style={{
          backgroundColor: "#f8f9ff",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label>📅 Month:</label><br />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={dropdownStyle}
            >
              <option value="All">All</option>
              {monthsList.map((month, i) => (
                <option key={i} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label>🗓️ Year:</label><br />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={dropdownStyle}
            >
              <option value="All">All</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Credit / Debit Summary + Charts */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          {/* Summary */}
          <div style={{ minWidth: "250px" }}>
            <div style={{ ...summaryBox, color: "green" }}>
              🟢 Credit: {formatCurrency(credit)}
            </div>
            <div style={{ ...summaryBox, color: "red" }}>
              🔴 Debit: {formatCurrency(debit)}
            </div>
            <div
              style={{
                ...summaryBox,
                color: net >= 0 ? "blue" : "darkred",
              }}
            >
              💼 Final Balance: {formatCurrency(net)}
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{ width: "300px", height: "250px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={{ width: "500px", height: "250px" }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Credit" fill="#00C49F" />
                <Bar dataKey="Debit" fill="#FF4C4C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🔹 All Transactions Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>All Transactions</h3>
        <div>
          <label>🔽 Sort by Date:</label>{" "}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={dropdownStyle}
          >
            <option value="Descending">Newest First</option>
            <option value="Ascending">Oldest First</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>No transactions found for this filter.</p>
      ) : (
        <table style={tableStyle}>
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
                <td style={tdStyle}>{formatCurrency(e.amount)}</td>
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

// 💅 Styles
const dropdownStyle = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const summaryBox = {
  background: "#fff",
  padding: "10px 16px",
  borderRadius: "8px",
  fontWeight: "600",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  marginBottom: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
  marginTop: "1rem",
};

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
