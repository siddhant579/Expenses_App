import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis
} from "recharts";
import "./AdminLogin.css";

const logo = process.env.PUBLIC_URL + "/logo.png";

// ✅ Multiple Users with Roles
const USERS = [
  { email: "superadmin@sanghamitra.com", password: "super123", role: "superadmin" },
  { email: "admin1@sanghamitra.com", password: "admin123", role: "admin" },
  { email: "admin2@sanghamitra.com", password: "admin123", role: "admin" },
  { email: "admin3@sanghamitra.com", password: "admin123", role: "admin" },
  { email: "admin4@sanghamitra.com", password: "admin123", role: "admin" }
];

// ✅ Main Category mapping
const MAIN_CATEGORIES = {
  Hyderabad: ["Grocery", "Household Work", "Computer Repair", "D-Mart", "Utilities", "Direct Payment", "UPI Payment", "Others"],
  Wardha: ["Products and Services", "Salary", "Travel and Transport", "Internet Recharge", "Petrol", "Office Rent", "Electricity Bill", "Others"],
  Engineering: ["Mechanical Components", "Electronic", "Drivers", "Raw Material", "Tools", "Workshop Items", "Prototyping and Fabrication Material", "Robotics", "Others"]
};

const AdminDashboard = ({ expenses }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");

  const monthsList = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const yearOptions = ["2020","2021","2022","2023","2024","2025"];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS.find((u) => u.email === email && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setRole(user.role);
      setError("");
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

  // ===== FILTER EXPENSES =====
  const filteredExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const monthMatch = selectedMonth === "All" ||
      expenseDate.toLocaleString("default", { month: "long" }) === selectedMonth;
    const yearMatch = selectedYear === "All" ||
      expenseDate.getFullYear().toString() === selectedYear;
    const mainCategoryMatch =
      selectedMainCategory === "All" ||
      MAIN_CATEGORIES[selectedMainCategory]?.includes(e.category);
    return monthMatch && yearMatch && mainCategoryMatch;
  });

  // ===== CSV EXPORT =====
  const convertToCSV = (data) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj).map((val) => `"${val}"`).join(",")
    );
    return [headers, ...rows].join("\r\n");
  };

  const downloadCSV = () => {
    if (filteredExpenses.length === 0) {
      alert("No data to download");
      return;
    }
    const csvData = filteredExpenses.map((e) => ({
      Date: new Date(e.date).toISOString().split("T")[0], // ✅ YYYY-MM-DD
      Category: e.category,
      Type: e.type,
      Amount: e.amount,
      Receipt: e.receiptURL || "No Receipt"
    }));
    const csvContent = convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${selectedMonth}_${selectedYear}_${selectedMainCategory}.csv`;
    link.click();
  };

  // ===== EXCEL EXPORT =====
  const downloadExcel = () => {
    if (filteredExpenses.length === 0) {
      alert("No data to download");
      return;
    }
    let excelContent = "Date\tCategory\tType\tAmount\tReceipt\n";
    filteredExpenses.forEach((e) => {
      excelContent += `${new Date(e.date).toISOString().split("T")[0]}\t${e.category}\t${e.type}\t${e.amount}\t${e.receiptURL || "No Receipt"}\n`;
    });
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${selectedMonth}_${selectedYear}_${selectedMainCategory}.xls`;
    link.click();
  };

  // ===== STATS =====
  const totalDebit = filteredExpenses.filter((e) => e.type === "Debit").reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = filteredExpenses.filter((e) => e.type === "Credit").reduce((sum, e) => sum + e.amount, 0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#aa33ff", "#ff3377"];
  const getCategoryData = (type) => {
    const map = {};
    filteredExpenses.filter((e) => e.type === type).forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };
  const creditData = getCategoryData("Credit");
  const debitData = getCategoryData("Debit");

  // ===== LOGIN PAGE =====
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2 className="login-title">Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="login-form" onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} className="login-input" required />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} className="login-input" required />
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ===== SUPERADMIN PAGE =====
  if (role === "superadmin") {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>🌟 SuperAdmin Dashboard</h1>
          <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
        <p>Welcome {email} (SuperAdmin)</p>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
          <label>🏢 Main Category:</label>
          <select value={selectedMainCategory} onChange={(e) => setSelectedMainCategory(e.target.value)}>
            <option value="All">All</option>
            {Object.keys(MAIN_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
          {/* Download buttons */}
          <button onClick={downloadCSV} style={csvBtnStyle}>📊 Download CSV</button>
          <button onClick={downloadExcel} style={excelBtnStyle}>📈 Download Excel</button>
        </div>

        {/* Summary */}
        <h2>🟢 Total Credit: ₹{totalCredit}</h2>
        <h2>🔴 Total Debit: ₹{totalDebit}</h2>
        <h2>💰 Net: ₹{totalCredit - totalDebit}</h2>

        {/* Charts */}
        <h3>📊 Credit Transactions</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={creditData} dataKey="value" nameKey="name" outerRadius={100} label>
                {creditData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <h3>📊 Debit Transactions</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={debitData}>
      <XAxis
        dataKey="name"
        label={{ value: "Product", position: "insideBottom", offset: -5 }}
      />
      <YAxis
        label={{ value: "Rupees", angle: -90, position: "insideLeft" }}
      />
      <Tooltip />
      <Bar dataKey="value" fill="#FFB347" /> {/* ✅ Light Orange Color */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ===== ADMIN PAGE =====
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>👑 Admin Dashboard</h1>
        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
      </div>
      <p>Welcome {email} (Admin)</p>

      {/* Filters Section */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
        <label>🏢 Main Category:</label>
        <select value={selectedMainCategory} onChange={(e) => setSelectedMainCategory(e.target.value)}>
          <option value="All">All</option>
          {Object.keys(MAIN_CATEGORIES).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

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

        {/* Download Buttons */}
        <button onClick={downloadCSV} style={csvBtnStyle}>📊 Download CSV</button>
        <button onClick={downloadExcel} style={excelBtnStyle}>📈 Download Excel</button>
      </div>

      {/* Summary */}
      <div style={{ 
        backgroundColor: '#e8f4fc', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        borderLeft: '5px solid #3498db'
      }}>
        <h2>Summary for: {selectedMonth} {selectedYear} ({selectedMainCategory})</h2>
        <p>🟢 Total Credit: ₹{totalCredit}</p>
        <p>🔴 Total Debit: ₹{totalDebit}</p>
        <p>💰 Net: ₹{totalCredit - totalDebit}</p>
      </div>

      <h3>📋 All Transactions</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#3498db", color: "" }}>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((e, i) => (
            <tr key={i}>
              <td style={tdStyle}>{new Date(e.date).toISOString().split("T")[0]}</td>
              <td style={tdStyle}>{e.category}</td>
              <td style={tdStyle}>{e.type}</td>
              <td style={tdStyle}>₹{e.amount}</td>
              <td style={tdStyle}>{e.receiptURL ? "View" : "No Receipt"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { border: "1px solid #ddd", padding: "8px" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };
const logoutBtnStyle = { padding: "6px 12px", background: "#e63946", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" };
const csvBtnStyle = { padding: "6px 12px", marginRight: "8px", background: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const excelBtnStyle = { padding: "6px 12px", background: "#2980b9", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default AdminDashboard;
