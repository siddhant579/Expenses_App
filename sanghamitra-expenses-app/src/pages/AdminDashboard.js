import React, { useState } from "react";
import {
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./AdminLogin.css";

const logo = process.env.PUBLIC_URL + "/logo.png";

const USERS = [
  { email: "superadmin@sanghamitra.com", password: "super123", role: "superadmin" },
  { email: "admin1@sanghamitra.com", password: "admin123", role: "admin", mainCategory: "Event Based" },
  { email: "admin2@sanghamitra.com", password: "admin123", role: "admin", mainCategory: "Office Based" },
  { email: "admin3@sanghamitra.com", password: "admin123", role: "admin", mainCategory: "Engineering Based" },
];

const MAIN_CATEGORIES = ["Event Based", "Office Based", "Engineering Based"];

const LOCATION_GROUPS = {
  "Event Based": ["Chaityabhoomi", "Deekshabhoomi"],
  "Office Based": ["Wardha", "Hyderabad"],
  "Engineering Based": ["Wardha", "Hyderabad"],
};

const PERSON_GROUPS = {
  Hyderabad: ["Mallesh", "Shignesh", "Rakshit", "Chandu", "Shreyas"],
  Wardha: ["Siddhant", "Mayur", "Apeksha", "Nikhil", "Vaibhav", "Prayag"],
  Chaityabhoomi: ["Mallesh", "Shignesh", "Rakshit", "Chandu", "Shreyas", "Siddhant", "Mayur", "Apeksha", "Nikhil", "Vaibhav", "Prayag"],
  Deekshabhoomi: ["Mallesh", "Shignesh", "Rakshit", "Chandu", "Shreyas", "Siddhant", "Mayur", "Apeksha", "Nikhil", "Vaibhav", "Prayag"],
};

const monthsList = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const yearOptions = ["2020","2021","2022","2023","2024","2025","2026","2027","2028","2029","2030"];

const AdminDashboard = ({ expenses }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [chartType, setChartType] = useState("Bar");

  // ===== LOGIN =====
  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setRole(user.role);
      setError("");
      if (user.role === "admin") {
        setSelectedMainCategory(user.mainCategory);
      }
    } else {
      setError("Invalid email or password!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setRole("");
  };

  // ===== FILTER =====
  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const monthMatch = selectedMonth === "All" || expenseDate.toLocaleString("default", { month: "long" }) === selectedMonth;
    const yearMatch = selectedYear === "All" || expenseDate.getFullYear().toString() === selectedYear;
    const mainMatch = selectedMainCategory === "All" || e.mainCategory === selectedMainCategory;
    const locMatch = selectedLocation === "All" || e.location === selectedLocation;
    const personMatch = selectedPerson === "All" || e.person === selectedPerson;
    return monthMatch && yearMatch && mainMatch && locMatch && personMatch;
  });

  // ===== UNIFIED PERSON DATA =====
  const unifiedPersonData = selectedPerson !== "All"
    ? expenses.filter(e => e.person === selectedPerson)
    : [];

  const unifiedDebit = unifiedPersonData.filter(e => e.type === "Debit").reduce((s, e) => s + e.amount, 0);
  const unifiedCredit = unifiedPersonData.filter(e => e.type === "Credit").reduce((s, e) => s + e.amount, 0);

  // ===== DEBIT BREAKDOWN BY MAIN CATEGORY =====
  const debitByMainCategory = {};
  unifiedPersonData
    .filter(e => e.type === "Debit")
    .forEach(e => {
      debitByMainCategory[e.mainCategory] = (debitByMainCategory[e.mainCategory] || 0) + e.amount;
    });

  const debitBreakdown = Object.entries(debitByMainCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  // ===== CREDIT/DEBIT CHART DATA =====
  const creditDebitData = [
    { name: "Credit", value: unifiedCredit, color: "#42b72a" },
    { name: "Debit", value: unifiedDebit, color: "#fa383e" }
  ];

  // ===== LOGIN PAGE =====
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>{role === "superadmin" ? "🌟 SuperAdmin Dashboard" : "👑 Admin Dashboard"}</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <label>🏢 Main Category:</label>
        <select value={selectedMainCategory} onChange={(e) => {
          setSelectedMainCategory(e.target.value);
          setSelectedLocation("All");
          setSelectedPerson("All");
        }}>
          <option value="All">All</option>
          {MAIN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {selectedMainCategory !== "All" && (
          <>
            <label>📍 Location:</label>
            <select value={selectedLocation} onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedPerson("All");
            }}>
              <option value="All">All</option>
              {LOCATION_GROUPS[selectedMainCategory].map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </>
        )}

        {selectedLocation !== "All" && (
          <>
            <label>👥 Person:</label>
            <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
              <option value="All">All</option>
              {PERSON_GROUPS[selectedLocation].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </>
        )}

        <label>📅 Month:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="All">All</option>
          {monthsList.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <label>🗓 Year:</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="All">All</option>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Unified Person Summary */}
      {selectedPerson !== "All" && (
        <div className="unified-summary">
          <h2>📋 Full Summary for {selectedPerson}</h2>
          
          <div className="summary-stats">
            <div className="summary-stat">
              <strong>🟢 Total Credit:</strong> ₹{unifiedCredit.toLocaleString("en-IN")}
            </div>
            <div className="summary-stat">
              <strong>🔴 Total Debit:</strong> ₹{unifiedDebit.toLocaleString("en-IN")}
            </div>
            <div className="summary-stat">
              <strong>💰 Net Balance:</strong> ₹{(unifiedCredit - unifiedDebit).toLocaleString("en-IN")}
            </div>
          </div>

          {/* Chart Type and Debit Breakdown */}
          <div className="chart-controls">
            <div>
              <label>Chart Type: </label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="Bar">Bar Chart</option>
                <option value="Pie">Pie Chart</option>
              </select>
            </div>
            
            {/* Debit Breakdown by Main Category */}
            <div className="debit-breakdown">
              <label>🔴 Debit Breakdown:</label>
              <div className="breakdown-items">
                {debitBreakdown.map((item, index) => (
                  <div key={index} className="breakdown-item">
                    <strong>{item.category}:</strong> ₹{item.amount.toLocaleString("en-IN")}
                  </div>
                ))}
                {debitBreakdown.length === 0 && (
                  <div className="breakdown-empty">
                    No debit transactions
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "Bar" ? (
                <BarChart data={creditDebitData}>
                  <XAxis dataKey="name" stroke="#b0b3b8" />
                  <YAxis stroke="#b0b3b8" />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]}
                    contentStyle={{ backgroundColor: '#242526', border: '1px solid #3a3b3c', color: '#e4e6ea' }}
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {creditDebitData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={creditDebitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ₹${value.toLocaleString("en-IN")}`}
                  >
                    {creditDebitData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]}
                    contentStyle={{ backgroundColor: '#242526', border: '1px solid #3a3b3c', color: '#e4e6ea' }}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Main Category</th>
                <th>Location</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {unifiedPersonData.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.mainCategory}</td>
                  <td>{e.location}</td>
                  <td>{e.category}</td>
                  <td>{e.type}</td>
                  <td>₹{e.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Normal Filtered Transactions */}
      <div className="transactions-section">
        <h3>Filtered Transactions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Main Category</th>
              <th>Location</th>
              <th>Person</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#5f9dedff' }}>
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.mainCategory}</td>
                  <td>{e.location}</td>
                  <td>{e.person}</td>
                  <td>{e.category}</td>
                  <td>{e.type}</td>
                  <td>₹{e.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
