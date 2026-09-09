import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import TransactionsPage from "../TransactionsPage";

const EXPENSES = [
  {
    _id: "e1",
    date: "2026-09-05T00:00:00.000Z",
    mainCategory: "Wardha Office",
    location: "Wardha Office",
    category: "Travel and Transport",
    type: "Debit",
    amount: 500,
    note: "cab",
    userId: { name: "Tester", organizationId: { name: "TestOrg" } },
  },
  {
    _id: "e2",
    date: "2026-09-06T00:00:00.000Z",
    mainCategory: "Hyderabad Office",
    location: "Hyderabad Office",
    category: "Salary",
    type: "Credit",
    amount: 10000,
    note: "",
    userId: { name: "Tester", organizationId: { name: "TestOrg" } },
  },
];

const BOOK_ORDERS = [
  {
    _id: "b1",
    itemType: "Book",
    customerName: "Shivam",
    shippingDate: "2026-09-07T00:00:00.000Z",
    bookName: "Kanshi Ram Ji Ki Sohabat Me",
    noOfBooks: 5,
    amountReceived: 1050,
    shippingCharges: 150,
    creditStatus: "Transfer to Sanghamitra",
    type: "Credit",
  },
  {
    _id: "b2",
    itemType: "Frames",
    customerName: "Ajeet Kumar",
    bookName: "Periyar by Sonali Meshram",
    noOfBooks: 1,
    amountReceived: 600,
    shippingCharges: 100,
    creditStatus: "Rahul",
    type: "Debit",
  },
];

beforeEach(() => {
  localStorage.setItem("token", "test-token");
  global.fetch = jest.fn((url) => {
    if (String(url).includes("/book-orders")) {
      return Promise.resolve({ ok: true, json: async () => BOOK_ORDERS });
    }
    return Promise.resolve({ ok: true, json: async () => EXPENSES });
  });
});

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

// heading <h3> -> (header div) -> panel card div
const panelOf = (heading) => heading.closest("h3").parentElement.parentElement;

test("renders the three panel headings", async () => {
  render(<TransactionsPage />);
  expect(await screen.findByText(/Main Section Breakdown/)).toBeInTheDocument();
  expect(screen.getByText(/Category Breakdown/)).toBeInTheDocument();
  expect(screen.getByText(/Book \/ Frames Orders/)).toBeInTheDocument();
});

test("panels are collapsed by default and open on header click", async () => {
  render(<TransactionsPage />);
  const heading = await screen.findByText(/Main Section Breakdown/);

  // collapsed: no table yet
  expect(panelOf(heading).querySelector("table")).toBeNull();

  fireEvent.click(heading);

  const table = within(panelOf(heading)).getByRole("table");
  expect(within(table).getByRole("cell", { name: "Wardha Office" })).toBeInTheDocument();
  expect(within(table).getByRole("cell", { name: "Hyderabad Office" })).toBeInTheDocument();
});

test("expanded main-section row reveals its transactions", async () => {
  render(<TransactionsPage />);
  const heading = await screen.findByText(/Main Section Breakdown/);
  fireEvent.click(heading);

  const table = within(panelOf(heading)).getByRole("table");
  fireEvent.click(within(table).getByRole("cell", { name: "Wardha Office" }));
  expect(within(table).getByText(/cab/)).toBeInTheDocument();
});

test("category breakdown groups by category once opened", async () => {
  render(<TransactionsPage />);
  const heading = await screen.findByText(/Category Breakdown/);
  fireEvent.click(heading);

  const table = within(panelOf(heading)).getByRole("table");
  expect(within(table).getByRole("cell", { name: "Travel and Transport" })).toBeInTheDocument();
  expect(within(table).getByRole("cell", { name: "Salary" })).toBeInTheDocument();
});

test("book orders panel: opens, defaults to Transfer to Sanghamitra, filters", async () => {
  render(<TransactionsPage />);
  const heading = await screen.findByText(/Book \/ Frames Orders/);

  // collapsed initially
  expect(screen.queryByText("Shivam")).not.toBeInTheDocument();

  fireEvent.click(heading);
  const panel = panelOf(heading);

  // default filter hides the non-Sanghamitra order
  expect(within(panel).getByText("Shivam")).toBeInTheDocument();
  expect(within(panel).queryByText("Ajeet Kumar")).not.toBeInTheDocument();

  fireEvent.change(within(panel).getByRole("combobox"), {
    target: { value: "All" },
  });
  expect(within(panel).getByText("Shivam")).toBeInTheDocument();
  expect(within(panel).getByText("Ajeet Kumar")).toBeInTheDocument();
});

test("All Transactions table is collapsed until its heading is clicked", async () => {
  render(<TransactionsPage />);
  const heading = await screen.findByText(/All Transactions/);

  expect(screen.queryByRole("cell", { name: "Travel and Transport" })).not.toBeInTheDocument();

  fireEvent.click(heading);
  expect(screen.getByRole("cell", { name: "Travel and Transport" })).toBeInTheDocument();
});
