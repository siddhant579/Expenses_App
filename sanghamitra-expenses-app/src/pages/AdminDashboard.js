import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import "./AdminLogin.css"; // Make sure this CSS file exists

const logo = process.env.PUBLIC_URL + "/logo.png"; // Public folder logo path

const AdminDashboard = ({ expenses }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "1234";

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password!");
    }
  };

  // ===== LOGIN PAGE =====
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2 className="login-title">Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD DATA =====
  const totalDebit = expenses
    .filter((e) => e.type === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCredit = expenses
    .filter((e) => e.type === "Credit")
    .reduce((sum, e) => sum + e.amount, 0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#aa33ff", "#ff3377"];

  const getCategoryData = (type) => {
    const map = {};
    expenses
      .filter((e) => e.type === type)
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  const creditData = getCategoryData("Credit");
  const debitData = getCategoryData("Debit");

  // ===== DASHBOARD UI =====
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <h2>💰 Total Credit: ₹{totalCredit}</h2>
      <h2>💸 Total Debit: ₹{totalDebit}</h2>

      {/* CREDIT CHARTS */}
      <h3>📊 Credit Transactions by Category</h3>
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={creditData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {creditData.map((_, i) => (
                <Cell key={`cell-credit-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 300, marginBottom: "3rem" }}>
        <ResponsiveContainer>
          <BarChart data={creditData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DEBIT CHARTS */}
      <h3>📊 Debit Transactions by Category</h3>
      <div style={{ width: "100%", height: 300, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={debitData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {debitData.map((_, i) => (
                <Cell key={`cell-debit-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={debitData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TRANSACTION TABLE */}
      <h3 style={{ marginTop: "2rem" }}>📋 All Transactions</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, i) => (
            <tr key={i}>
              <td style={tdStyle}>{e.category}</td>
              <td style={tdStyle}>{e.type}</td>
              <td style={tdStyle}>₹{e.amount}</td>
              <td style={tdStyle}>{e.date}</td>
              <td style={tdStyle}>
                {e.receiptURL && (
                  <a href={e.receiptURL} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

export default AdminDashboard;