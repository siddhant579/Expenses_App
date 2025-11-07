//fetch("https://expenses-app-server-one.vercel.app/api/")
//pp.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TrackerPage from "./pages/TrackerPage";
import TransactionsPage from "./pages/TransactionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Bootstrap import
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
      {/* ✅ Full responsive container */}
      <div className="container-fluid px-3">
        <h1 className="main-title text-center my-3">Sanghamitra Expense Tracker</h1>

        {/* ✅ Responsive Navigation (but CSS same rahega) */}
        <nav className="d-flex flex-wrap justify-content-center gap-3 mb-3">
          <NavLink to="/" end>🏠 Home</NavLink>
          <NavLink to="/transactions">📜 Transactions</NavLink>
          <NavLink to="/admin">👑 Admin</NavLink>
        </nav>

        {/* ✅ Responsive content area */}
        <div className="row">
          <div className="col-12 col-md-10 col-lg-8 mx-auto">
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
        </div>
      </div>
    </Router>
  );
};

export default App;
