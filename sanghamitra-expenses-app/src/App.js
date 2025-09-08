// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TrackerPage from "./pages/TrackerPage";
import TransactionsPage from "./pages/TransactionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [accountBalance, setAccountBalance] = useState(10000);

  // ✅ Fetch expenses only once here
  useEffect(() => {
    fetch("https://expenses-app-server-one.vercel.app/api/")
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Error fetching expenses:", err));
  }, []);

  return (
    <Router>
      <div className="container dark-background">
        <h1 className="main-title">Sanghamitra Expense Tracker</h1>

        {/* Navigation */}
        <nav style={{ marginBottom: "1rem" }}>
          <NavLink to="/" end>🏠 Home</NavLink>
          <NavLink to="/transactions">📜 Transactions</NavLink>
          <NavLink to="/admin">👑 Admin</NavLink>
        </nav>

        {/* Routing */}
        <Routes>
          <Route
            path="/"
            element={
              <TrackerPage
                expenses={expenses}
                setExpenses={setExpenses}
                accountBalance={accountBalance}
                setAccountBalance={setAccountBalance}
              />
            }
          />
          <Route
            path="/transactions"
            element={<TransactionsPage expenses={expenses} />}
          />
          <Route
            path="/admin"
            element={<AdminDashboard expenses={expenses} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
