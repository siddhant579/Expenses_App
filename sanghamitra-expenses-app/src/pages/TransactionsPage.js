import React, { useState, useEffect } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://expenses-app-server-one.vercel.app/api";

const TransactionsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [announcement, setAnnouncement] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const yearOptions = [
    "2025",
    "2026","2027","2028","2029","2030"
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

  const [bookOrders, setBookOrders] = useState([]);

  useEffect(() => {
    fetchExpenses();
    fetchBookOrders();
  }, []);

  const fetchBookOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/book-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setBookOrders(await res.json());
      }
    } catch (err) {
      console.error("Error fetching book orders:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
        
        if (data.length > 0 && data[0].userId && data[0].userId.organizationId) {
          setOrganization(data[0].userId.organizationId);
        }
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const showAnnouncement = (message, type = 'success') => {
    setAnnouncement({ message, type });
    setTimeout(() => setAnnouncement(null), 3000);
  };

  const handleEditClick = (expense) => {
    setEditingId(expense._id);
    setEditAmount(expense.amount.toString());
  };

  const handleEditNoteClick = (expense) => {
    setEditingNoteId(expense._id);
    setEditNote(expense.note || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const handleCancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditNote("");
  };

  const handleSaveEdit = async (expenseId) => {
    const newAmount = parseFloat(editAmount);
    
    if (isNaN(newAmount) || newAmount <= 0) {
      showAnnouncement("⚠️ Please enter a valid amount", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAnnouncement("⚠️ Please login again", "error");
        return;
      }

      // Update in backend
      const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: newAmount }),
      });

      if (!res.ok) {
        throw new Error("Failed to update expense");
      }

      // Update local state
      setExpenses(expenses.map(exp => 
        exp._id === expenseId ? { ...exp, amount: newAmount } : exp
      ));
      
      showAnnouncement("✅ Amount updated successfully!", "success");
      setEditingId(null);
      setEditAmount("");
    } catch (err) {
      console.error("Error updating expense:", err);
      showAnnouncement("❌ Failed to update amount. Please try again.", "error");
    }
  };

  const handleSaveNoteEdit = async (expenseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAnnouncement("⚠️ Please login again", "error");
        return;
      }

      // Update in backend
      const res = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: editNote }),
      });

      if (!res.ok) {
        throw new Error("Failed to update note");
      }

      // Update local state
      setExpenses(expenses.map(exp => 
        exp._id === expenseId ? { ...exp, note: editNote } : exp
      ));
      
      showAnnouncement("✅ Note updated successfully!", "success");
      setEditingNoteId(null);
      setEditNote("");
    } catch (err) {
      console.error("Error updating note:", err);
      showAnnouncement("❌ Failed to update note. Please try again.", "error");
    }
  };

  const calculateTotalsFor = (month, year, mainCat, loc) => {
    const filtered = expenses.filter((e) => {
      const expenseDate = new Date(e.date);

      const monthMatch =
        month === "All" ||
        expenseDate.toLocaleString("default", { month: "long" }) === month;

      const yearMatch =
        year === "All" ||
        expenseDate.getFullYear().toString() === year;

      const mainMatch =
        mainCat === "All" || e.mainCategory === mainCat;

      const locMatch =
        loc === "All" || e.location === loc;

      return monthMatch && yearMatch && mainMatch && locMatch;
    });

    const credit = filtered.filter((e) => e.type === "Credit")
      .reduce((sum, e) => sum + e.amount, 0);

    const debit = filtered.filter((e) => e.type === "Debit")
      .reduce((sum, e) => sum + e.amount, 0);

    return { 
      credit, 
      debit, 
      net: credit - debit, 
      list: filtered,
      totalTransactions: filtered.length
    };
  };

  const { 
    credit: totalCredit, 
    debit: totalDebit, 
    net: currentNet, 
    list: filtered,
    totalTransactions 
  } = calculateTotalsFor(selectedMonth, selectedYear, selectedMainCategory, selectedLocation);

  let carryOver = 0;
  if (selectedMonth !== "All" && selectedYear !== "All") {
    const monthIndex = monthsList.indexOf(selectedMonth);
    const yearNum = parseInt(selectedYear);
    let prevMonth = "";
    let prevYear = yearNum;

    if (monthIndex > 0) {
      prevMonth = monthsList[monthIndex - 1];
    } else {
      prevMonth = "December";
      prevYear = yearNum - 1;
    }

    const { net: prevNet } = calculateTotalsFor(
      prevMonth,
      prevYear.toString(),
      selectedMainCategory,
      selectedLocation
    );
    carryOver = prevNet;
  }

  // Group filtered transactions by a key with credit/debit/net + the rows
  const buildBreakdown = (list, keyFn) => {
    const map = {};
    list.forEach((expense) => {
      const key = keyFn(expense) || "Uncategorized";
      if (!map[key]) {
        map[key] = { key, credit: 0, debit: 0, count: 0, items: [] };
      }
      if (expense.type === "Credit") map[key].credit += expense.amount;
      else map[key].debit += expense.amount;
      map[key].count += 1;
      map[key].items.push(expense);
    });

    return Object.values(map)
      .map((c) => ({ ...c, net: c.credit - c.debit }))
      .sort((a, b) => b.credit + b.debit - (a.credit + a.debit));
  };

  const sectionBreakdown = buildBreakdown(filtered, (e) => e.mainCategory);
  const categoryBreakdown = buildBreakdown(filtered, (e) => e.category);
  const finalBalance = carryOver + currentNet;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading transactions...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Announcement Banner */}
      {announcement && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 20px',
          borderRadius: '8px',
          backgroundColor: announcement.type === 'success' ? '#d4edda' : '#f8d7da',
          color: announcement.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${announcement.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontWeight: '600',
          minWidth: '300px'
        }}>
          {announcement.message}
        </div>
      )}

      {/* Header with Organization Name */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#2c3e50', 
          marginBottom: '5px',
          fontSize: '2.5rem'
        }}>
          📊 Transactions
        </h1>
        {organization && (
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '1.2rem',
            fontWeight: '500'
          }}>
            Organization: <strong>{organization.name || organization}</strong>
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={cardStyle}>
          <div style={cardIconStyle}>📈</div>
          <div style={cardContentStyle}>
            <h3 style={cardTitleStyle}>Total Transactions</h3>
            <p style={cardValueStyle}>{totalTransactions}</p>
          </div>
        </div>

        <div style={{...cardStyle, borderLeft: '4px solid #27ae60'}}>
          <div style={cardIconStyle}>💹</div>
          <div style={cardContentStyle}>
            <h3 style={cardTitleStyle}>Total Credit</h3>
            <p style={{...cardValueStyle, color: '#27ae60'}}>
              {formatCurrency(totalCredit)}
            </p>
          </div>
        </div>

        <div style={{...cardStyle, borderLeft: '4px solid #e74c3c'}}>
          <div style={cardIconStyle}>📉</div>
          <div style={cardContentStyle}>
            <h3 style={cardTitleStyle}>Total Debit</h3>
            <p style={{...cardValueStyle, color: '#e74c3c'}}>
              {formatCurrency(totalDebit)}
            </p>
          </div>
        </div>

        <div style={{...cardStyle, borderLeft: '4px solid #3498db'}}>
          <div style={cardIconStyle}>💰</div>
          <div style={cardContentStyle}>
            <h3 style={cardTitleStyle}>Net Balance</h3>
            <p style={{
              ...cardValueStyle, 
              color: currentNet >= 0 ? '#27ae60' : '#e74c3c'
            }}>
              {formatCurrency(currentNet)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>🔍 Filters</h3>
        <div style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <div style={filterGroupStyle}>
            <label htmlFor="mainCat" style={labelStyle}>🏢 Main Category:</label>
            <select
              id="mainCat"
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedLocation("All");
              }}
              style={selectStyle}
            >
              <option value="All">All</option>
              {mainCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {selectedMainCategory !== "All" && (
            <div style={filterGroupStyle}>
              <label htmlFor="location" style={labelStyle}>📍 Location:</label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {locationGroups[selectedMainCategory]?.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          )}

          <div style={filterGroupStyle}>
            <label htmlFor="month" style={labelStyle}>📅 Month:</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All</option>
              {monthsList.map((month, i) => (
                <option key={i} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label htmlFor="year" style={labelStyle}>🗓️ Year:</label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Filter Summary */}
      <div style={{
        backgroundColor: '#e8f4fd',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #b3d9ff'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          📋 Current Filter: {selectedMainCategory} • {selectedLocation} • {selectedMonth} {selectedYear}
        </h4>
        {selectedMonth !== "All" && selectedYear !== "All" && (
          <p style={{ margin: '5px 0', color: '#e67e22' }}>
            📦 Carried Over from last month: <strong>{formatCurrency(carryOver)}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <p style={{ margin: '5px 0', color: '#27ae60' }}>
            🟢 Total Credited: <strong>{formatCurrency(totalCredit)}</strong>
          </p>
          <p style={{ margin: '5px 0', color: '#e74c3c' }}>
            🔴 Total Debited: <strong>{formatCurrency(totalDebit)}</strong>
          </p>
          <p style={{ 
            margin: '5px 0', 
            color: finalBalance >= 0 ? '#2980b9' : '#c0392b', 
            fontWeight: "bold" 
          }}>
            💼 Final Balance: <strong>{formatCurrency(finalBalance)}</strong>
          </p>
        </div>
      </div>

      {/* Main Expense Section Breakdown */}
      <BreakdownPanel
        title="📁 Main Section Breakdown"
        keyHeader="Expense Section"
        rows={sectionBreakdown}
      />

      {/* Category Breakdown */}
      <BreakdownPanel
        title="📊 Category Breakdown"
        keyHeader="Category"
        rows={categoryBreakdown}
      />

      {/* Book / Frames Orders (Offline) */}
      <BookOrdersPanel orders={bookOrders} />

      {/* Transactions Table */}
      <div>
        <h3
          onClick={() => setShowTransactions((s) => !s)}
          style={{
            color: '#2c3e50',
            marginBottom: '15px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span style={{ color: '#7f8c8d', marginRight: 8 }}>
            {showTransactions ? '▾' : '▸'}
          </span>
          📜 All Transactions ({filtered.length})
        </h3>
        {!showTransactions ? null : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '18px', margin: '0' }}>No transactions found for this filter.</p>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{ backgroundColor: "#34495e" }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Main Category</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Note</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} style={{
                    backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa'
                  }}>
                    <td style={tdStyle}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{e.mainCategory}</td>
                    <td style={tdStyle}>{e.location || "—"}</td>
                    <td style={tdStyle}>{e.category}</td>
                    <td style={{
                      ...tdStyle,
                      color: e.type === 'Credit' ? '#27ae60' : '#e74c3c',
                      fontWeight: '600'
                    }}>
                      {e.type}
                    </td>
                    <td style={{
                      ...tdStyle,
                      fontWeight: '600',
                      color: e.type === 'Credit' ? '#27ae60' : '#e74c3c'
                    }}>
                      {editingId === e._id ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          style={{
                            width: '100px',
                            padding: '5px',
                            border: '2px solid #3498db',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          autoFocus
                        />
                      ) : (
                        formatCurrency(e.amount)
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingNoteId === e._id ? (
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '5px',
                            border: '2px solid #9b59b6',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          autoFocus
                        />
                      ) : (
                        e.note || '-'
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {editingId === e._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(e._id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#27ae60',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#95a5a6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(e)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#3498db',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            ✏️ Amount
                          </button>
                        )}
                        
                        {editingNoteId === e._id ? (
                          <>
                            <button
                              onClick={() => handleSaveNoteEdit(e._id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#27ae60',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelNoteEdit}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#95a5a6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditNoteClick(e)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#9b59b6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            📝 Note
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  border: '1px solid #e9ecef',
  borderLeft: '4px solid #3498db',
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const cardIconStyle = {
  fontSize: '2rem',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px'
};

const cardContentStyle = {
  flex: 1
};

const cardTitleStyle = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  color: '#6c757d',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const cardValueStyle = {
  margin: '0',
  fontSize: '24px',
  fontWeight: '700',
  color: '#2c3e50'
};

const filterGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#495057'
};

const selectStyle = {
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '14px',
  minWidth: '150px'
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold",
  color: '#fff',
  backgroundColor: '#34495e'
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  fontSize: '14px'
};

const formatCurrency = (num) => "₹" + (num || 0).toLocaleString("en-IN");

// Collapse a multi-line address into one clean, comma-separated line
const formatAddress = (addr) => {
  if (!addr) return "—";
  return addr
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
};

const addressCellStyle = {
  minWidth: "220px",
  maxWidth: "280px",
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.4,
};

const collapsibleHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '16px 20px',
  backgroundColor: '#f8f9fa',
  cursor: 'pointer',
  userSelect: 'none',
};

// Reusable collapsible breakdown panel (grouped by section or by category)
const BreakdownPanel = ({ title, keyHeader, rows }) => {
  const [view, setView] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  if (!rows || rows.length === 0) return null;

  const visible = view === "All" ? rows : rows.filter((r) => r.key === view);

  return (
    <div style={{
      marginBottom: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          ...collapsibleHeaderStyle,
          borderBottom: collapsed ? 'none' : '1px solid #e9ecef',
        }}
      >
        <h3 style={{ color: '#2c3e50', margin: 0 }}>
          <span style={{ color: '#7f8c8d', marginRight: 8 }}>
            {collapsed ? '▸' : '▾'}
          </span>
          {title} ({rows.length})
        </h3>
        {!collapsed && (
          <select
            value={view}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setView(e.target.value);
              setExpanded(null);
            }}
            style={selectStyle}
          >
            <option value="All">All ({rows.length})</option>
            {rows.map((r) => (
              <option key={r.key} value={r.key}>{r.key}</option>
            ))}
          </select>
        )}
      </div>

      {!collapsed && (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e' }}>
              <th style={thStyle}></th>
              <th style={thStyle}>{keyHeader}</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Txns</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Credit</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Net</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c, i) => {
              const isOpen = expanded === c.key;
              return (
                <React.Fragment key={c.key}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : c.key)}
                    style={{
                      backgroundColor: isOpen ? '#eef4fb' : i % 2 === 0 ? '#fff' : '#f8f9fa',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ ...tdStyle, width: '32px', textAlign: 'center', color: '#7f8c8d' }}>
                      {isOpen ? '▾' : '▸'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: '600', color: '#2c3e50' }}>{c.key}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{c.count}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#27ae60', fontWeight: '600' }}>
                      {formatCurrency(c.credit)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#e74c3c', fontWeight: '600' }}>
                      {formatCurrency(c.debit)}
                    </td>
                    <td style={{
                      ...tdStyle,
                      textAlign: 'right',
                      fontWeight: '700',
                      color: c.net >= 0 ? '#2980b9' : '#c0392b'
                    }}>
                      {formatCurrency(c.net)}
                    </td>
                  </tr>

                  {isOpen && c.items.map((item, j) => (
                    <tr key={`${c.key}-${j}`} style={{ backgroundColor: '#dfe7f1' }}>
                      <td style={{ ...tdStyle, borderLeft: '3px solid #2980b9' }}></td>
                      <td style={{ ...tdStyle, color: '#3d4a5c', fontSize: '13px', fontWeight: '500' }}>
                        {new Date(item.date).toLocaleDateString('en-IN')}
                        {' · '}
                        {keyHeader === 'Category' ? (item.mainCategory || '—') : (item.category || '—')}
                        {item.note ? ` — ${item.note}` : ''}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: '13px', color: '#3d4a5c' }}>
                        {item.location || '—'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontSize: '13px', color: '#1e8449', fontWeight: '600' }}>
                        {item.type === 'Credit' ? formatCurrency(item.amount) : '—'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontSize: '13px', color: '#c0392b', fontWeight: '600' }}>
                        {item.type === 'Debit' ? formatCurrency(item.amount) : '—'}
                      </td>
                      <td style={tdStyle}></td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#ecf0f1', fontWeight: '700' }}>
              <td style={tdStyle}></td>
              <td style={{ ...tdStyle, color: '#2c3e50' }}>Total</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                {visible.reduce((s, c) => s + c.count, 0)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#27ae60' }}>
                {formatCurrency(visible.reduce((s, c) => s + c.credit, 0))}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#e74c3c' }}>
                {formatCurrency(visible.reduce((s, c) => s + c.debit, 0))}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#2980b9' }}>
                {formatCurrency(visible.reduce((s, c) => s + c.net, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
    </div>
  );
};

// 📚 Book / Frames offline orders — focus on "Transfer to Sanghamitra"
const BookOrdersPanel = ({ orders }) => {
  const SANGHAMITRA = "Transfer to Sanghamitra";
  const [view, setView] = useState(SANGHAMITRA);
  const [collapsed, setCollapsed] = useState(true);

  if (!orders || orders.length === 0) return null;

  const statuses = Array.from(
    new Set(orders.map((o) => o.creditStatus).filter(Boolean))
  );
  const options = ["All", SANGHAMITRA, ...statuses.filter((s) => s !== SANGHAMITRA)];

  const visible =
    view === "All" ? orders : orders.filter((o) => o.creditStatus === view);

  const totalReceived = visible.reduce(
    (s, o) => s + (o.amountReceived || 0),
    0
  );
  const totalShipping = visible.reduce(
    (s, o) => s + (o.shippingCharges || 0),
    0
  );

  return (
    <div style={{
      marginBottom: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          ...collapsibleHeaderStyle,
          borderBottom: collapsed ? 'none' : '1px solid #e9ecef',
        }}
      >
        <h3 style={{ color: '#2c3e50', margin: 0 }}>
          <span style={{ color: '#7f8c8d', marginRight: 8 }}>
            {collapsed ? '▸' : '▾'}
          </span>
          📚 Book / Frames Orders ({orders.length})
        </h3>
        {!collapsed && (
          <select
            value={view}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setView(e.target.value)}
            style={selectStyle}
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o === "All" ? `All (${orders.length})` : o}
              </option>
            ))}
          </select>
        )}
      </div>

      {!collapsed && (
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        padding: '12px 20px',
        borderBottom: '1px solid #e9ecef',
        fontSize: '14px'
      }}>
        <span style={{ color: '#495057' }}>
          Orders: <strong>{visible.length}</strong>
        </span>
        <span style={{ color: '#27ae60' }}>
          Amount Received: <strong>{formatCurrency(totalReceived)}</strong>
        </span>
        <span style={{ color: '#e67e22' }}>
          Shipping Charges: <strong>{formatCurrency(totalShipping)}</strong>
        </span>
      </div>
      )}

      {!collapsed && (visible.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#6c757d' }}>
          No orders for “{view}”.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e' }}>
                <th style={thStyle}>Sr. No</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Customer</th>
                <th style={{ ...thStyle, ...addressCellStyle }}>Address</th>
                <th style={thStyle}>Shipping Date</th>
                <th style={thStyle}>Name</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Qty</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount Received</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Shipping</th>
                <th style={thStyle}>Credit Status</th>
                <th style={thStyle}>Credit / Debit</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o, i) => (
                <tr key={o._id || i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{o.itemType || 'Book'}</td>
                  <td style={tdStyle}>{o.customerName}</td>
                  <td style={{ ...tdStyle, ...addressCellStyle }} title={o.address || ""}>
                    {formatAddress(o.address)}
                  </td>
                  <td style={tdStyle}>
                    {o.shippingDate
                      ? new Date(o.shippingDate).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td style={tdStyle}>{o.bookName || '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{o.noOfBooks || 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#27ae60', fontWeight: '600' }}>
                    {formatCurrency(o.amountReceived)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {formatCurrency(o.shippingCharges)}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: o.creditStatus === SANGHAMITRA ? '#1e7e34' : '#8b1a1a',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {o.creditStatus || '—'}
                    </span>
                  </td>
                  <td style={{
                    ...tdStyle,
                    fontWeight: '600',
                    color: o.type === 'Credit' ? '#27ae60' : '#e74c3c'
                  }}>
                    {o.type || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TransactionsPage;
