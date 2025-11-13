import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const orgCode = user?.organizationId?.code || 'N/A';

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

      // Fetch employees list
      const employeesResponse = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const employeeCount = employees.length;
  const transactionCount = allExpenses.length;

  // Group expenses by employee for display
  const employeeExpenseMap = {};
  allExpenses.forEach(expense => {
    const userId = expense.userId?._id || expense.userId;
    if (!employeeExpenseMap[userId]) {
      employeeExpenseMap[userId] = {
        expenses: [],
        total: 0,
        count: 0
      };
    }
    employeeExpenseMap[userId].expenses.push(expense);
    employeeExpenseMap[userId].total += expense.amount || 0;
    employeeExpenseMap[userId].count += 1;
  });

  // Group by category
  const categoryTotals = {};
  allExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryTotals[category]) {
      categoryTotals[category] = {
        total: 0,
        count: 0
      };
    }
    categoryTotals[category].total += expense.amount || 0;
    categoryTotals[category].count += 1;
  });

  // Calculate credit and debit totals
  const totalCredit = allExpenses
    .filter(e => e.type === 'Credit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
    
  const totalDebit = allExpenses
    .filter(e => e.type === 'Debit')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const netBalance = totalCredit - totalDebit;

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
                    {copied ? '✓' : '📋'}
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
                    {linkCopied ? '✓' : '📋'}
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
          <div className="card border-0 shadow-sm h-100 bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Total Credit</p>
                  <h3 className="mb-0 fw-bold">
                    ₹{totalCredit.toFixed(2)}
                  </h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  💹
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
                  <p className="mb-1 opacity-75 small">Total Debit</p>
                  <h3 className="mb-0 fw-bold">
                    ₹{totalDebit.toFixed(2)}
                  </h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  📉
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 opacity-75 small">Net Balance</p>
                  <h3 className="mb-0 fw-bold">₹{netBalance.toFixed(2)}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  💰
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
                  <p className="mb-1 opacity-75 small">Transactions</p>
                  <h3 className="mb-0 fw-bold">{transactionCount}</h3>
                </div>
                <div className="rounded-circle bg-white bg-opacity-25 p-3">
                  👥
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  👥
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Active Employees</h6>
                  <h3 className="mb-0 fw-bold">{employeeCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  📊
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Avg Transaction</h6>
                  <h3 className="mb-0 fw-bold">
                    ₹{transactionCount > 0 ? (totalExpenses / transactionCount).toFixed(2) : 0}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Overview */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0">👥 Employees Overview</h5>
        </div>
        <div className="card-body p-0">
          {employees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No employees yet. Share your organization code!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Employee</th>
                    <th className="border-0">Email</th>
                    <th className="border-0 text-end">Total Expenses</th>
                    <th className="border-0 text-end">Transactions</th>
                    <th className="border-0 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const empStats = employeeExpenseMap[emp._id] || { total: 0, count: 0 };
                    return (
                      <tr key={emp._id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              👤
                            </div>
                            <strong>{emp.name}</strong>
                          </div>
                        </td>
                        <td className="align-middle text-muted">{emp.email}</td>
                        <td className="align-middle text-end fw-bold text-success">
                          ₹{empStats.total.toFixed(2)}
                        </td>
                        <td className="align-middle text-end">
                          <span className="badge bg-info">{empStats.count}</span>
                        </td>
                        <td className="align-middle text-center">
                          <button
                            onClick={() => viewEmployeeDetails(emp._id)}
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#employeeModal"
                          >
                            👁️
                          </button>
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

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0">🏷️ Expense by Category</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([category, data]) => (
                  <div key={category} className="col-md-6 col-lg-3">
                    <div className="border rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        🏷️
                        <h6 className="mb-0 ms-2">{category}</h6>
                      </div>
                      <h4 className="mb-0 text-success">₹{data.total.toFixed(2)}</h4>
                      <small className="text-muted">
                        {data.count} transactions • {((data.total / totalExpenses) * 100).toFixed(1)}%
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* All Transactions */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0">📜 All Transactions</h5>
        </div>
        <div className="card-body p-0">
          {allExpenses.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No transactions yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Employee</th>
                    <th className="border-0">Category</th>
                    <th className="border-0">Location</th>
                    <th className="border-0">Type</th>
                    <th className="border-0 text-end">Amount</th>
                    <th className="border-0">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allExpenses.slice(0, 20).map((expense, idx) => (
                    <tr key={expense._id || idx}>
                      <td className="align-middle">
                        <small className="text-muted">
                          {expense.userId?.name || 'Unknown'}
                        </small>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {expense.category}
                        </span>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">{expense.location || '-'}</small>
                      </td>
                      <td className="align-middle">
                        <span className={`badge ${expense.type === 'Credit' ? 'bg-success' : 'bg-danger'}`}>
                          {expense.type}
                        </span>
                      </td>
                      <td className="align-middle text-end fw-bold text-success">
                        ₹{expense.amount?.toFixed(2)}
                      </td>
                      <td className="align-middle text-muted">
                        <small>
                          {new Date(expense.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {allExpenses.length > 20 && (
          <div className="card-footer bg-white border-0 text-center">
            <small className="text-muted">Showing 20 of {allExpenses.length} transactions</small>
          </div>
        )}
      </div>

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
