// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, CheckCircle, Users, DollarSign, TrendingUp, Calendar, Tag } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const AdminDashboard = ({ expenses: propExpenses }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [expenses, setExpenses] = useState(propExpenses || []);

  const orgCode = user?.organizationId?.code || 'N/A';

  useEffect(() => {
    if (!propExpenses || propExpenses.length === 0) {
      fetchExpenses();
    }
  }, [propExpenses]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(orgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRegistrationLink = () => {
    const registrationLink = `https://expenses-app-frontend.vercel.app/register?code=${orgCode}`;
    navigator.clipboard.writeText(registrationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="container py-4">
      {/* Welcome & Organization Code Card */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="mb-2">Welcome, {user?.name}! 👑</h4>
              <p className="text-muted mb-0">
                Organization: <strong>{user?.organizationId?.name}</strong>
              </p>
            </div>
            <div className="col-md-4 mt-3 mt-md-0">
              <div className="alert alert-primary mb-0">
                <p className="small mb-2 fw-semibold">Share this code with employees:</p>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <code className="flex-grow-1 bg-white px-3 py-2 rounded border border-primary">
                    {orgCode}
                  </code>
                  <button
                    onClick={copyCode}
                    className="btn btn-primary btn-sm"
                    title="Copy code"
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <input 
                    type="text" 
                    className="form-control form-control-sm bg-white" 
                    value={`https://expenses-app-frontend.vercel.app/register?code=${orgCode}`}
                    readOnly
                  />
                  <button
                    onClick={copyRegistrationLink}
                    className="btn btn-success btn-sm text-nowrap"
                    title="Copy registration link"
                  >
                    {linkCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    <span className="ms-1 d-none d-sm-inline">
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <DollarSign className="text-success" size={28} />
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Total Expenses</h6>
                  <h3 className="mb-0 fw-bold">₹{totalExpenses.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <Users className="text-primary" size={28} />
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Total Transactions</h6>
                  <h3 className="mb-0 fw-bold">{expenses.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <TrendingUp className="text-info" size={28} />
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Avg Transaction</h6>
                  <h3 className="mb-0 fw-bold">₹{avgExpense.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0">Expense by Category</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, total]) => (
                  <div key={category} className="col-md-6 col-lg-3">
                    <div className="border rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <Tag size={18} className="text-primary me-2" />
                        <h6 className="mb-0">{category}</h6>
                      </div>
                      <h4 className="mb-0 text-success">₹{total.toFixed(2)}</h4>
                      <small className="text-muted">
                        {((total / totalExpenses) * 100).toFixed(1)}% of total
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0">Recent Transactions</h5>
        </div>
        <div className="card-body p-0">
          {expenses.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Calendar size={48} className="mb-3 opacity-50" />
              <p className="mb-0">No transactions yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Description</th>
                    <th className="border-0">Category</th>
                    <th className="border-0">Amount</th>
                    <th className="border-0">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 15).map((expense, idx) => (
                    <tr key={idx}>
                      <td className="align-middle">{expense.description}</td>
                      <td className="align-middle">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {expense.category}
                        </span>
                      </td>
                      <td className="align-middle fw-bold text-success">
                        ₹{expense.amount?.toFixed(2)}
                      </td>
                      <td className="align-middle text-muted">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
