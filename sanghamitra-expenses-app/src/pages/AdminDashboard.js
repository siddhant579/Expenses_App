import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, Users, DollarSign, TrendingUp, TrendingDown, ArrowRight, Calendar } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const orgCode = user?.organizationId?.code || 'N/A';

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const expensesResponse = await fetch(`${API_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expensesData = await expensesResponse.json();
      setAllExpenses(expensesData);

      const statsResponse = await fetch(`${API_URL}/expenses/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

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
    const registrationLink = `http://localhost:3000/register?code=${orgCode}`;
    navigator.clipboard.writeText(registrationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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

  const totalCredit = allExpenses.filter(e => e.type === 'Credit').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalDebit = allExpenses.filter(e => e.type === 'Debit').reduce((sum, e) => sum + (e.amount || 0), 0);
  const netBalance = totalCredit - totalDebit;
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const employeeCount = employees.length;
  const transactionCount = allExpenses.length;

  // Group by category for top spending
  const categoryTotals = {};
  allExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += expense.amount || 0;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate monthly trend (current month vs last month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = allExpenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const lastMonthExpenses = allExpenses.filter(e => {
    const date = new Date(e.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;

  // Top spenders (employees)
  const employeeExpenses = {};
  allExpenses.forEach(exp => {
    const userId = exp.userId?._id || exp.userId;
    const userName = exp.userId?.name || 'Unknown';
    if (!employeeExpenses[userId]) {
      employeeExpenses[userId] = { name: userName, total: 0, count: 0 };
    }
    employeeExpenses[userId].total += exp.amount || 0;
    employeeExpenses[userId].count += 1;
  });

  const topSpenders = Object.values(employeeExpenses)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1400px' }}>
      {/* Welcome & Organization Code Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h3 className="mb-2 fw-bold">Welcome back, {user?.name}! 👋</h3>
                  <p className="text-muted mb-0">
                    <strong>{user?.organizationId?.name}</strong> • Organization Dashboard
                  </p>
                </div>
                <div className="col-md-6 mt-3 mt-md-0">
                  <div className="bg-primary bg-opacity-10 rounded p-3">
                    <p className="small text-muted mb-2 fw-semibold">Organization Code</p>
                    <div className="d-flex gap-2 mb-2">
                      <code className="flex-grow-1 bg-white px-3 py-2 rounded border fw-bold fs-5">
                        {orgCode}
                      </code>
                      <button onClick={copyCode} className="btn btn-sm btn-primary" title="Copy code">
                        {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <input 
                        type="text" 
                        className="form-control form-control-sm bg-white" 
                        value={`http://localhost:3000/register?code=${orgCode}`}
                        readOnly
                      />
                      <button onClick={copyRegistrationLink} className="btn btn-sm btn-success text-nowrap">
                        {linkCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">Total Credit</p>
                  <h2 className="mb-0 fw-bold">₹{totalCredit.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <TrendingUp size={24} />
                </div>
              </div>
              <small className="opacity-75">All time income</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">Total Debit</p>
                  <h2 className="mb-0 fw-bold">₹{totalDebit.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <TrendingDown size={24} />
                </div>
              </div>
              <small className="opacity-75">All time expenses</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">Net Balance</p>
                  <h2 className="mb-0 fw-bold">₹{netBalance.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <DollarSign size={24} />
                </div>
              </div>
              <small className="opacity-75">Current balance</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">Transactions</p>
                  <h2 className="mb-0 fw-bold">{transactionCount}</h2>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <Calendar size={24} />
                </div>
              </div>
              <small className="opacity-75">Total records</small>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                  <Users className="text-primary" size={28} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Active Employees</p>
                  <h3 className="mb-0 fw-bold">{employeeCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                  <DollarSign className="text-success" size={28} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Avg Transaction</p>
                  <h3 className="mb-0 fw-bold">
                    ₹{transactionCount > 0 ? Math.round(totalExpenses / transactionCount).toLocaleString('en-IN') : 0}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className={`bg-${monthlyChange >= 0 ? 'danger' : 'success'} bg-opacity-10 rounded p-3 me-3`}>
                  {monthlyChange >= 0 ? (
                    <TrendingUp className="text-danger" size={28} />
                  ) : (
                    <TrendingDown className="text-success" size={28} />
                  )}
                </div>
                <div>
                  <p className="text-muted mb-1 small">Monthly Change</p>
                  <h3 className="mb-0 fw-bold">
                    {monthlyChange >= 0 ? '+' : ''}{monthlyChange}%
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-3 mb-4">
        {/* Top Categories */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-bold">Top Spending Categories</h5>
              <small className="text-muted">Highest expense categories</small>
            </div>
            <div className="card-body">
              {topCategories.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>No data available</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {topCategories.map(([category, amount], index) => {
                    const percentage = (amount / totalExpenses * 100).toFixed(1);
                    return (
                      <div key={category}>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-semibold">{category}</span>
                          <span className="text-muted">₹{amount.toLocaleString('en-IN')} ({percentage}%)</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar bg-${['primary', 'success', 'info', 'warning', 'danger'][index]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Spenders */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-bold">Top Employee Expenses</h5>
              <small className="text-muted">Employees with highest spending</small>
            </div>
            <div className="card-body">
              {topSpenders.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>No data available</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {topSpenders.map((employee, index) => {
                    const percentage = (employee.total / totalExpenses * 100).toFixed(1);
                    return (
                      <div key={index}>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-semibold">{employee.name}</span>
                          <span className="text-muted">
                            ₹{employee.total.toLocaleString('en-IN')} • {employee.count} txn
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar bg-${['primary', 'success', 'info', 'warning', 'danger'][index]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm bg-primary bg-opacity-10">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-2">View All Transactions</h5>
              <p className="text-muted mb-3">
                Access detailed transaction history with advanced filtering options
              </p>
              <button 
                onClick={() => navigate('/admin/transactions')}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                Go to Transactions <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm bg-success bg-opacity-10">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-2">Employee Management</h5>
              <p className="text-muted mb-3">
                {employeeCount} active employee{employeeCount !== 1 ? 's' : ''} in your organization
              </p>
              <button 
                onClick={copyRegistrationLink}
                className="btn btn-success d-flex align-items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <CheckCircle size={18} /> Link Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copy Invite Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
