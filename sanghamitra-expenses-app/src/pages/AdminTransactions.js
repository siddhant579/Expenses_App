// src/pages/AdminTransactionsPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { Download, Filter, X } from 'lucide-react';

const API_URL = 'https://expenses-app-server-one.vercel.app/api';

const AdminTransactionsPage = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const yearOptions = [
    "2020", "2021", "2022", "2023", "2024", "2025",
    "2026", "2027", "2028", "2029", "2030"
  ];

  const mainCategories = [
    "Event Based",
    "Office Based",
    "Engineering Based"
  ];

  const locationGroups = {
    "Event Based": ["Chaityabhoomi", "Deekshabhoomi"],
    "Office Based": ["Wardha", "Hyderabad"],
    "Engineering Based": ["Hyderabad", "Wardha"],
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all expenses
      const expensesResponse = await fetch(`${API_URL}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const expensesData = await expensesResponse.json();
      setExpenses(expensesData);

      // Fetch employees
      const employeesResponse = await fetch(`${API_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from expenses
  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))];

  // Filter logic
  const filtered = expenses.filter((e) => {
    const expenseDate = new Date(e.date);

    // Employee filter
    const employeeMatch =
      selectedEmployee === "All" || 
      (e.userId?._id === selectedEmployee || e.userId === selectedEmployee);

    // Month filter
    const monthMatch =
      selectedMonth === "All" ||
      expenseDate.toLocaleString("default", { month: "long" }) === selectedMonth;

    // Year filter
    const yearMatch =
      selectedYear === "All" ||
      expenseDate.getFullYear().toString() === selectedYear;

    // Main category filter
    const mainMatch =
      selectedMainCategory === "All" || e.mainCategory === selectedMainCategory;

    // Location filter
    const locMatch =
      selectedLocation === "All" || e.location === selectedLocation;

    // Category filter
    const catMatch =
      selectedCategory === "All" || e.category === selectedCategory;

    // Type filter
    const typeMatch =
      selectedType === "All" || e.type === selectedType;

    // Date range filter
    const dateRangeMatch = (!dateRange.start || expenseDate >= new Date(dateRange.start)) &&
                           (!dateRange.end || expenseDate <= new Date(dateRange.end));

    return employeeMatch && monthMatch && yearMatch && mainMatch && 
           locMatch && catMatch && typeMatch && dateRangeMatch;
  });

  // Calculate totals
  const totalCredit = filtered
    .filter((e) => e.type === "Credit")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDebit = filtered
    .filter((e) => e.type === "Debit")
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalCredit - totalDebit;

  // Group by category
  const categoryStats = {};
  filtered.forEach(exp => {
    if (!categoryStats[exp.category]) {
      categoryStats[exp.category] = { credit: 0, debit: 0, count: 0 };
    }
    if (exp.type === 'Credit') categoryStats[exp.category].credit += exp.amount;
    if (exp.type === 'Debit') categoryStats[exp.category].debit += exp.amount;
    categoryStats[exp.category].count += 1;
  });

  const formatCurrency = (num) => "₹" + (num || 0).toLocaleString("en-IN");

  const clearFilters = () => {
    setSelectedEmployee("All");
    setSelectedMonth("All");
    setSelectedYear("All");
    setSelectedMainCategory("All");
    setSelectedLocation("All");
    setSelectedCategory("All");
    setSelectedType("All");
    setDateRange({ start: "", end: "" });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Employee", "Main Category", "Location", "Category", "Type", "Amount", "Person"];
    const rows = filtered.map(e => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.userId?.name || 'Unknown',
      e.mainCategory,
      e.location || '',
      e.category,
      e.type,
      e.amount,
      e.person || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📊 All Transactions</h2>
        <button onClick={exportToCSV} className="btn btn-success btn-sm">
          <Download size={16} className="me-2" />
          Export CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <Filter size={20} className="me-2" />
              Filters
            </h5>
            <button onClick={clearFilters} className="btn btn-sm btn-outline-secondary">
              <X size={16} className="me-1" />
              Clear All
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Employee Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">👤 Employee</label>
              <select
                className="form-select"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="All">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Category Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">🏢 Main Category</label>
              <select
                className="form-select"
                value={selectedMainCategory}
                onChange={(e) => {
                  setSelectedMainCategory(e.target.value);
                  setSelectedLocation("All");
                }}
              >
                <option value="All">All Categories</option>
                {mainCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">📍 Location</label>
              <select
                className="form-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={selectedMainCategory === "All"}
              >
                <option value="All">All Locations</option>
                {selectedMainCategory !== "All" &&
                  locationGroups[selectedMainCategory]?.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">🏷️ Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">📅 Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="All">All Months</option>
                {monthsList.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">🗓️ Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="All">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">💳 Type</label>
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">📆 Date Range</label>
              <div className="d-flex gap-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-success text-white">
            <div className="card-body">
              <h6 className="opacity-75 mb-2">Total Credit</h6>
              <h3 className="mb-0">{formatCurrency(totalCredit)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-danger text-white">
            <div className="card-body">
              <h6 className="opacity-75 mb-2">Total Debit</h6>
              <h3 className="mb-0">{formatCurrency(totalDebit)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card border-0 shadow-sm text-white ${netBalance >= 0 ? 'bg-primary' : 'bg-warning'}`}>
            <div className="card-body">
              <h6 className="opacity-75 mb-2">Net Balance</h6>
              <h3 className="mb-0">{formatCurrency(netBalance)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-info text-white">
            <div className="card-body">
              <h6 className="opacity-75 mb-2">Transactions</h6>
              <h3 className="mb-0">{filtered.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4">
            <h5 className="mb-0">Category Breakdown</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-end">Credit</th>
                    <th className="text-end">Debit</th>
                    <th className="text-end">Net</th>
                    <th className="text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categoryStats)
                    .sort((a, b) => (b[1].credit + b[1].debit) - (a[1].credit + a[1].debit))
                    .map(([cat, stats]) => (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td className="text-end text-success">{formatCurrency(stats.credit)}</td>
                        <td className="text-end text-danger">{formatCurrency(stats.debit)}</td>
                        <td className="text-end fw-bold">{formatCurrency(stats.credit - stats.debit)}</td>
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

      {/* Transactions Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-4">
          <h5 className="mb-0">Transactions List ({filtered.length})</h5>
        </div>
        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No transactions found matching the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Date</th>
                    <th className="border-0">Employee</th>
                    <th className="border-0">Person</th>
                    <th className="border-0">Main Category</th>
                    <th className="border-0">Location</th>
                    <th className="border-0">Category</th>
                    <th className="border-0">Type</th>
                    <th className="border-0 text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={e._id || i}>
                      <td className="align-middle">
                        <small>{new Date(e.date).toLocaleDateString('en-IN')}</small>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">{e.userId?.name || 'Unknown'}</small>
                      </td>
                      <td className="align-middle">{e.person || '—'}</td>
                      <td className="align-middle">
                        <small className="text-muted">{e.mainCategory}</small>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">{e.location || '—'}</small>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {e.category}
                        </span>
                      </td>
                      <td className="align-middle">
                        <span className={`badge ${e.type === 'Credit' ? 'bg-success' : 'bg-danger'}`}>
                          {e.type}
                        </span>
                      </td>
                      <td className="align-middle text-end fw-bold">
                        {formatCurrency(e.amount)}
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

export default AdminTransactionsPage;
