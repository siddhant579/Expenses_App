import React, { useState } from "react";

const TransactionsPage = ({ expenses }) => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // 🔹 Years till 2030
  const yearOptions = [
    "2020","2021","2022","2023","2024","2025",
    "2026","2027","2028","2029","2030"
  ];

  // 🔹 Fixed main categories
  const mainCategories = [
    "Event Based",
    "Office Based",
    "Engineering Based"
  ];

  // 🔹 Location groups (same logic as TrackerPage)
  const locationGroups = {
    "Event Based": ["Chaityabhoomi", "Deekshabhoomi"],
    "Office Based": ["Wardha", "Hyderabad"],
    "Engineering Based": ["Hyderabad", "Wardha"],
  };

  // 🔹 Filter calculation
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

    return { credit, debit, net: credit - debit, list: filtered };
  };

  const { credit: totalCredit, debit: totalDebit, net: currentNet, list: filtered } =
    calculateTotalsFor(selectedMonth, selectedYear, selectedMainCategory, selectedLocation);

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

  return (
    <div>
      <h1>Transactions</h1>

      {/* Filters Section */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {/* 🔹 Main Category */}
        <label htmlFor="mainCat">🏢 Main Category:</label>
        <select
          id="mainCat"
          value={selectedMainCategory}
          onChange={(e) => {
            setSelectedMainCategory(e.target.value);
            setSelectedLocation("All");
          }}
        >
          <option value="All">All</option>
          {mainCategories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        {/* 🔹 Location Dropdown (appears when mainCategory is selected) */}
        {selectedMainCategory !== "All" && (
          <>
            <label htmlFor="location">📍 Location:</label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All</option>
              {locationGroups[selectedMainCategory]?.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </>
        )}

        {/* 🔹 Month Filter */}
        <label htmlFor="month">📅 Month:</label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All</option>
          {monthsList.map((month, i) => (
            <option key={i} value={month}>{month}</option>
          ))}
        </select>

        {/* 🔹 Year Filter */}
        <label htmlFor="year">🗓️ Year:</label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <h2>Summary for: {selectedMainCategory}, {selectedLocation}, {selectedMonth} {selectedYear}</h2>
      {selectedMonth !== "All" && selectedYear !== "All" && (
        <p style={{ color: "orange" }}>
          📦 Carried Over from last month: {formatCurrency(carryOver)}
        </p>
      )}
      <p style={{ color: "green" }}>🟢 Total Credited: {formatCurrency(totalCredit)}</p>
      <p style={{ color: "red" }}>🔴 Total Debited: {formatCurrency(totalDebit)}</p>
      <p style={{ color: finalBalance >= 0 ? "blue" : "darkred", fontWeight: "bold" }}>
        💼 Final Balance (Carry Over + Current Net): {formatCurrency(finalBalance)}
      </p>

      {/* Category Totals */}
      <h3>Category Totals</h3>
      <ul>
        {Object.entries(categoryTotals).map(([key, val]) => (
          <li key={key}>{key.replace("-", " ➝ ")}: {formatCurrency(val)}</li>
        ))}
      </ul>

      {/* Transactions Table */}
      <h3>All Transactions</h3>
      {filtered.length === 0 ? (
        <p>No transactions found for this filter.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Main Category</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i}>
                <td style={tdStyle}>{new Date(e.date).toLocaleDateString()}</td>
                <td style={tdStyle}>{e.mainCategory}</td>
                <td style={tdStyle}>{e.location || "—"}</td>
                <td style={tdStyle}>{e.category}</td>
                <td style={tdStyle}>{e.type}</td>
                <td style={tdStyle}>{formatCurrency(e.amount)}</td>
                <td style={tdStyle}>
                  {e.receiptURL ? (
                    <a href={e.receiptURL} target="_blank" rel="noopener noreferrer">View</a>
                  ) : "No Receipt"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Table Styles
const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default TransactionsPage;
