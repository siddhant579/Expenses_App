import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrackerPage from "../TrackerPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <TrackerPage />
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.setItem("token", "test-token");
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: async () => [] })
  );
});

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

// works for <input> and <select>
const field = (c, name) => c.querySelector(`[name="${name}"]`);
const optionValues = (el) =>
  [...el.options].map((o) => o.value).filter(Boolean);

test("cascading Section -> Category dropdowns appear with right options", () => {
  const { container } = renderPage();

  expect(field(container, "categoryGroup")).toBeNull();

  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Books Publication" },
  });

  const groupSel = field(container, "categoryGroup");
  expect(groupSel).not.toBeNull();
  expect(optionValues(groupSel)).toEqual([
    "Transfers & Salary",
    "Operations",
    "Products & Services",
    "Others",
  ]);

  expect(field(container, "category")).toBeNull();
  fireEvent.change(groupSel, { target: { value: "Products & Services" } });

  const catSel = field(container, "category");
  expect(catSel).not.toBeNull();
  expect(optionValues(catSel)).toEqual([
    "Products and Services",
    "Book",
    "Frames",
    "Other",
  ]);
});

test("selecting Book opens the order form; credit status has no name option", () => {
  const { container } = renderPage();

  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Books Publication" },
  });
  fireEvent.change(field(container, "categoryGroup"), {
    target: { value: "Products & Services" },
  });
  fireEvent.change(field(container, "category"), { target: { value: "Book" } });

  expect(screen.getByText(/Book Order/i)).toBeInTheDocument();
  expect(screen.queryByText(/Offline/i)).not.toBeInTheDocument();
  expect(field(container, "book_customerName")).not.toBeNull();
  expect(field(container, "book_itemNameOption")).not.toBeNull();

  const nameOpts = optionValues(field(container, "book_itemNameOption"));
  expect(nameOpts).toContain("Cast & Class");
  expect(nameOpts).toContain("Other");

  const csOpts = optionValues(field(container, "book_creditStatusOption"));
  expect(csOpts).toEqual(["Transfer to Sanghamitra", "Custom"]);
  expect(csOpts.some((o) => /^To\b/.test(o))).toBe(false);
});

test("Frames uses the frame catalog names", () => {
  const { container } = renderPage();

  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Books Publication" },
  });
  fireEvent.change(field(container, "categoryGroup"), {
    target: { value: "Products & Services" },
  });
  fireEvent.change(field(container, "category"), { target: { value: "Frames" } });

  expect(screen.getByText(/Frames Order/i)).toBeInTheDocument();
  const nameOpts = optionValues(field(container, "book_itemNameOption"));
  expect(nameOpts).toContain("Periyar by Sonali Meshram");
  expect(nameOpts).not.toContain("Cast & Class");
});

test("Utilities reveals a Custom Details field, Travel and Transport does not", () => {
  const { container } = renderPage();

  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Wardha Office" },
  });
  fireEvent.change(field(container, "categoryGroup"), {
    target: { value: "Operations" },
  });
  fireEvent.change(field(container, "category"), {
    target: { value: "Utilities" },
  });
  expect(field(container, "customCategory")).not.toBeNull();

  fireEvent.change(field(container, "category"), {
    target: { value: "Travel and Transport" },
  });
  expect(field(container, "customCategory")).toBeNull();
});

test("no submitted-history tables render on the tracker page", () => {
  renderPage();
  expect(screen.queryByText(/Recently Submitted/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Book \/ Frames Orders/i)).not.toBeInTheDocument();
});

test("submitting a Book order posts to /book-orders with the resolved payload", async () => {
  window.alert = jest.fn();
  const { container } = renderPage();

  fireEvent.change(field(container, "date"), { target: { value: "2026-09-07" } });
  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Books Publication" },
  });
  fireEvent.change(field(container, "categoryGroup"), {
    target: { value: "Products & Services" },
  });
  fireEvent.change(field(container, "category"), { target: { value: "Book" } });

  fireEvent.change(field(container, "book_customerName"), {
    target: { value: "Shivam" },
  });
  fireEvent.change(field(container, "book_itemNameOption"), {
    target: { value: "Savari" },
  });
  fireEvent.change(field(container, "book_amountReceived"), {
    target: { value: "1050" },
  });
  fireEvent.change(field(container, "book_creditStatusOption"), {
    target: { value: "Transfer to Sanghamitra" },
  });
  fireEvent.change(field(container, "type"), { target: { value: "Credit" } });

  global.fetch.mockClear();
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ _id: "x" }) });

  fireEvent.click(screen.getByText(/Submit All Expenses/i));

  await waitFor(() =>
    expect(
      global.fetch.mock.calls.some((c) => String(c[0]).includes("/book-orders"))
    ).toBe(true)
  );
  const call = global.fetch.mock.calls.find((c) =>
    String(c[0]).includes("/book-orders")
  );
  expect(call[1].method).toBe("POST");
  const body = JSON.parse(call[1].body);
  expect(body).toMatchObject({
    itemType: "Book",
    customerName: "Shivam",
    bookName: "Savari",
    amountReceived: 1050,
    creditStatus: "Transfer to Sanghamitra",
    type: "Credit",
  });
  expect(
    global.fetch.mock.calls.some((c) => /\/expenses$/.test(String(c[0])))
  ).toBe(false);
});

test("regular category shows amount field, not the book form", () => {
  const { container } = renderPage();

  fireEvent.change(field(container, "mainCategory"), {
    target: { value: "Hyderabad Office" },
  });
  fireEvent.change(field(container, "categoryGroup"), {
    target: { value: "Transfers & Salary" },
  });
  fireEvent.change(field(container, "category"), { target: { value: "Salary" } });

  expect(field(container, "amount")).not.toBeNull();
  expect(field(container, "book_customerName")).toBeNull();
});
