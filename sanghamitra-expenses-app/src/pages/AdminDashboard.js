// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, CheckCircle, Users, DollarSign, TrendingUp, Calendar, Tag, User, Eye } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All");

  const orgCode = user?.organizationId?.code || 'N/A';

  const monthsList = [
    "All", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all expenses for the organization
      const expensesResponse = await fetch(`${API_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expensesData = await expensesResponse.json();
      setAllExpenses(expensesData);

      // Fetch statistics
      const statsResponse = await fetch(`${API_URL}/expenses/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch employees list
      const employeesResponse = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

      console.log('Dashboard Data:', { stats: statsData, employees: employeesData, expenses: expensesData });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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

  const viewEmployeeDetails = async (employeeId) => {
    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedEmployee(data);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
  };

  // Add the missing formatCurrency function
  const formatCurrency = (num) => "₹" + (num || 0).toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Filter expenses by selected month
  const filteredExpenses = selectedMonth === "All" 
    ? allExpenses 
    : allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toLocaleString("default", { month: "long" }) === selectedMonth;
      });

  // Calculate totals based on filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const employeeCount = employees.length;
  const transactionCount = filteredExpenses.length;
  const totalDebited = filteredExpenses
    .filter(e => e.type === 'Debit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCredited = filteredExpenses
    .filter(e => e.type === 'Credit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group expenses by employee for display with debit/credit separation
  const employeeExpenseMap = {};
  filteredExpenses.forEach(expense => {
    const userId = expense.userId?._id || expense.userId;
    if (!employeeExpenseMap[userId]) {
      employeeExpenseMap[userId] = {
        expenses: [],
        totalDebited: 0,
        totalCredited: 0,
        count: 0
      };
    }
    employeeExpenseMap[userId].expenses.push(expense);
    if (expense.type === 'Debit') {
      employeeExpenseMap[userId].totalDebited += expense.amount || 0;
    } else if (expense.type === 'Credit') {
      employeeExpenseMap[userId].totalCredited += expense.amount || 0;
    }
    employeeExpenseMap[userId].count += 1;
  });

  // Group by category - only track debited amounts
  const categoryStats = {};
  filteredExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryStats[category]) {
      categoryStats[category] = {
        debited: 0,
        count: 0
      };
    }
    if (expense.type === 'Debit') {
      categoryStats[category].debited += expense.amount || 0;
    }
    categoryStats[category].count += 1;
  });

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
                  <button onClick={copyCode} className="btn btn-primary btn-sm" title="Copy code">
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
                  <button onClick={copyRegistrationLink} className="btn btn-success btn-sm text-nowrap">
                    {linkCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    <span className="ms-1 d-none d-sm-inline">
                      {linkCopied ? 'Copied!' : 'Link'}
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
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Number of Employees</p>
                  <h3 className="mb-0 fw-bold">{employeeCount}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <Users size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Number of Transactions</p>
                  <h3 className="mb-0 fw-bold">{transactionCount}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <TrendingUp size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Total Debited Amount</p>
                  <h3 className="mb-0 fw-bold">₹{totalDebited.toFixed(2)}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <DollarSign size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Total Credited Amount</p>
                  <h3 className="mb-0 fw-bold">₹{totalCredited.toFixed(2)}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  <DollarSign size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Overview */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <Users className="me-2" size={20} />
              Employees Overview
            </h5>
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 fw-semibold">📅 Month:</label>
              <select
                className="form-select form-select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: '150px' }}
              >
                {monthsList.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {employees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Users size={48} className="mb-3 opacity-50" />
              <p className="mb-0">No employees yet. Share your organization code!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Employee</th>
                    <th className="border-0">Email</th>
                    <th className="border-0 text-end">Debited</th>
                    <th className="border-0 text-end">Credited</th>
                    <th className="border-0 text-end">Balance</th>
                    <th className="border-0 text-end">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const empStats = employeeExpenseMap[emp._id] || { 
                      totalDebited: 0, 
                      totalCredited: 0, 
                      count: 0 
                    };
                    const balance = empStats.totalDebited - empStats.totalCredited;
                    
                    return (
                      <tr key={emp._id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <User size={16} className="text-primary" />
                            </div>
                            <strong>{emp.name}</strong>
                          </div>
                        </td>
                        <td className="align-middle text-muted">{emp.email}</td>
                        <td className="align-middle text-end fw-bold text-danger">
                          ₹{empStats.totalDebited.toFixed(2)}
                        </td>
                        <td className="align-middle text-end fw-bold text-success">
                          ₹{empStats.totalCredited.toFixed(2)}
                        </td>
                        <td className="align-middle text-end fw-bold">
                          <span className={balance >= 0 ? 'text-danger' : 'text-success'}>
                            ₹{Math.abs(balance).toFixed(2)}
                            {balance < 0 && ' (Credit)'}
                          </span>
                        </td>
                        <td className="align-middle text-end">
                          <span className="badge bg-info">{empStats.count}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown - Only Debited */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0">Category Breakdown {selectedMonth !== "All" && `- ${selectedMonth}`}</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-end">Debited Amount</th>
                    <th className="text-center">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1].debited - a[1].debited)
                    .map(([cat, stats]) => (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td className="text-end fw-bold text-danger">
                          {formatCurrency(stats.debited)}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary">{stats.count}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      <div className="modal fade" id="employeeModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Employee Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedEmployee ? (
                <>
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-3">Employee Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-2"><strong>Name:</strong> {selectedEmployee.employee.name}</p>
                        <p className="mb-2"><strong>Email:</strong> {selectedEmployee.employee.email}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Total Expenses:</strong> 
                          <span className="text-success fw-bold ms-2">₹{selectedEmployee.totalExpenses.toFixed(2)}</span>
                        </p>
                        <p className="mb-0">
                          <strong>Total Transactions:</strong> 
                          <span className="badge bg-info ms-2">{selectedEmployee.expenseCount}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h6 className="text-muted mb-3">Transaction History</h6>
                  {selectedEmployee.expenses.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p>No transactions yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead className="bg-light">
                          <tr>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th className="text-end">Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmployee.expenses.map((exp, idx) => (
                            <tr key={exp._id || idx}>
                              <td>{exp.category}</td>
                              <td><small className="text-muted">{exp.location || '-'}</small></td>
                              <td>
                                <span className={`badge ${exp.type === 'Credit' ? 'bg-success' : 'bg-danger'}`}>
                                  {exp.type}
                                </span>
                              </td>
                              <td className="text-end fw-bold">₹{exp.amount.toFixed(2)}</td>
                              <td>
                                <small>
                                  {new Date(exp.date).toLocaleDateString('en-IN')}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
