import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "../expense-form";
import type { CategoryRecord } from "@/lib/db/schema";

vi.mock("@/lib/actions", () => ({
  addCategory: vi.fn(),
}));

const mockCategories: CategoryRecord[] = [
  {
    id: "cat-1",
    userId: "user-1",
    name: "Food & Drink",
    icon: "utensils-crossed",
    color: "bg-amber-50 text-amber-700",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "cat-2",
    userId: "user-1",
    name: "Transport",
    icon: "bus",
    color: "bg-blue-50 text-blue-700",
    createdAt: "",
    updatedAt: "",
  },
];

const mockAction = vi.fn().mockResolvedValue(null);

describe("ExpenseForm", () => {
  it("renders all form fields", () => {
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    expect(screen.getAllByPlaceholderText(/what did you spend/i).length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText("0.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Date").length).toBeGreaterThan(0);
  });

  it("renders category buttons from props", () => {
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    expect(screen.getAllByRole("button", { name: /food & drink/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /transport/i }).length).toBeGreaterThan(0);
  });

  it("renders new category button", () => {
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    expect(screen.getAllByRole("button", { name: /new/i }).length).toBeGreaterThan(0);
  });

  it("shows Add Expense button in add mode", () => {
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    expect(screen.getAllByRole("button", { name: /add expense/i }).length).toBeGreaterThan(0);
  });

  it("shows Update Expense button in edit mode", () => {
    const expense = {
      id: "exp-1",
      userId: "user-1",
      tripId: "trip-1",
      description: "Lunch",
      amount: 15,
      currency: "SGD",
      amountInr: 937.5,
      category: "cat-1",
      status: "paid",
      date: "2026-06-28",
      notes: null,
      createdAt: "",
      updatedAt: "",
    };

    render(
      <ExpenseForm
        action={mockAction}
        expense={expense}
        categories={mockCategories}
      />
    );

    expect(screen.getAllByRole("button", { name: /update expense/i }).length).toBeGreaterThan(0);
  });

  it("toggles status buttons", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const paidBtn = screen.getAllByRole("button", { name: "paid" })[0];
    await user.click(paidBtn);
    const statusInputs = document.querySelectorAll('input[name="status"]');
    expect(statusInputs[0]).toHaveValue("paid");

    const plannedBtn = screen.getAllByRole("button", { name: "planned" })[0];
    await user.click(plannedBtn);
    expect(statusInputs[0]).toHaveValue("planned");
  });

  it("toggles currency buttons", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const sgdBtn = screen.getAllByRole("button", { name: "S$" })[0];
    await user.click(sgdBtn);

    const currencyInputs = document.querySelectorAll('input[name="currency"]');
    expect(currencyInputs[0]).toHaveValue("SGD");
  });

  it("selects category on click", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const transportBtn = screen.getAllByRole("button", { name: /transport/i })[0];
    await user.click(transportBtn);

    const categoryInputs = document.querySelectorAll('input[name="category"]');
    expect(categoryInputs[0]).toHaveValue("cat-2");
  });

  it("shows validation error on blur for short description", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const descInput = screen.getAllByPlaceholderText(/what did you spend/i)[0];
    await user.type(descInput, "a");
    await user.tab();

    expect(screen.getAllByText(/at least 2 characters/i).length).toBeGreaterThan(0);
  });

  it("shows validation error on blur for invalid amount", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const amountInput = screen.getAllByPlaceholderText("0.00")[0];
    await user.type(amountInput, "abc");
    await user.tab();

    expect(screen.getAllByText(/valid number/i).length).toBeGreaterThan(0);
  });

  it("shows INR preview for non-INR currency", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm action={mockAction} categories={mockCategories} />);

    const sgdBtn = screen.getAllByRole("button", { name: "S$" })[0];
    await user.click(sgdBtn);

    const amountInput = screen.getAllByPlaceholderText("0.00")[0];
    await user.clear(amountInput);
    await user.type(amountInput, "10");

    const body = document.body.textContent || "";
    expect(body).toContain("625.00");
  });
});
