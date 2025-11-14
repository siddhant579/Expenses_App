// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import TrackerPage from "./pages/TrackerPage";
import TransactionsPage from "./pages/TransactionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTransactionsPage from "./pages/AdminTransactions";
import LoginPage from "./pages/login";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import RegistrationPage from "./pages/Registration";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LogOut } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_URL = "https://expenses-app-server-one.vercel.app/api";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? "/admin" : "/"} replace />;
  }

  return children;
};

// Main App Content with Navigation
const AppContent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [accountBalance, setAccountBalance] = useState(10000);

  // Fetch expenses
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/`)
        .then((res) => res.json())
        .then((data) => setExpenses(data))
        .catch((err) => console.error("Error fetching expenses:", err));
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="container-fluid px-3">
        {/* Header - Show only when authenticated */}
        {isAuthenticated && (
          <>
            <div className="d-flex justify-content-between align-items-center my-3">
              <h1 className="main-title text-center flex-grow-1">
                Sanghamitra Expense Tracker
              </h1>
              <button
                onClick={logout}
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            {/* Navigation - Show based on role */}
            <nav className="d-flex flex-wrap justify-content-center gap-3 mb-3">
              {user?.role === 'admin' ? (
                <>
                  <NavLink to="/admin" end>👑 Admin Dashboard</NavLink>
                  <NavLink to="/admin-transactions">📜 All Transactions</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" end>🏠 Home</NavLink>
                  <NavLink to="/transactions">📜 Transactions</NavLink>
                </>
              )}
            </nav>
          </>
        )}

        {/* Main Content Area */}
        <div className="row">
          <div className="col-12 col-md-10 col-lg-8 mx-auto">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegistrationPage />
                  </PublicRoute>
                }
              />  
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />

              {/* Protected Employee Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <TrackerPage
                      expenses={expenses}
                      setExpenses={setExpenses}
                      accountBalance={accountBalance}
                      setAccountBalance={setAccountBalance}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard expenses={expenses} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-transactions"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTransactionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsPage expenses={expenses} />
                  </ProtectedRoute>
                }
              />


              {/* Catch all - redirect to appropriate dashboard */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      !isAuthenticated
                        ? "/login"
                        : user?.role === 'admin'
                        ? "/admin"
                        : "/"
                    }
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

// Main App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
