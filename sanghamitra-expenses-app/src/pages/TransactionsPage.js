import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch("https://expenses-app-server-one.vercel.app/api/expenses", {
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
      const res = await fetch(`https://expenses-app-server-one.vercel.app/api/expenses/${expenseId}`, {
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
      const res = await fetch(`https://expenses-app-server-one.vercel.app/api/expenses/${expenseId}`, {
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

  const getTotalByCategory = () => {
    const totals = {};
    filtered.forEach((expense) => {
      const key = `${expense.category}-${expense.type}`;
      if (!totals[key]) totals[key] = 0;
      totals[key] += expense.amount;
    });
    return totals;
  };

  const categoryTotals = getTotalByCategory();
  const finalBalance = carryOver + currentNet;
  const formatCurrency = (num) => "₹" + (num || 0).toLocaleString("en-IN");

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

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Category Breakdown</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '10px'
          }}>
            {Object.entries(categoryTotals).map(([key, val]) => (
              <div key={key} style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '500', color: '#495057' }}>
                  {key.replace("-", " → ")}
                </span>
                <span style={{ 
                  fontWeight: '600', 
                  color: key.includes('Credit') ? '#27ae60' : '#e74c3c'
                }}>
                  {formatCurrency(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
          📜 All Transactions ({filtered.length})
        </h3>
        {filtered.length === 0 ? (
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

export default TransactionsPage;
