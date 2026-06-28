import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryForm } from "../category-form";

const mockAction = vi.fn().mockResolvedValue(null);

describe("CategoryForm", () => {
  it("renders name input and icon/color sections", () => {
    render(<CategoryForm action={mockAction} />);

    expect(screen.getAllByPlaceholderText(/category name/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Icon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Color").length).toBeGreaterThan(0);
  });

  it("shows Create Category button in add mode", () => {
    render(<CategoryForm action={mockAction} />);

    expect(screen.getAllByRole("button", { name: /create category/i }).length).toBeGreaterThan(0);
  });

  it("shows Update Category button in edit mode", () => {
    const category = {
      id: "cat-1",
      userId: "user-1",
      name: "Food",
      icon: "utensils-crossed",
      color: "bg-amber-50 text-amber-700",
      createdAt: "",
      updatedAt: "",
    };

    render(<CategoryForm action={mockAction} category={category} />);

    expect(screen.getAllByRole("button", { name: /update category/i }).length).toBeGreaterThan(0);
  });

  it("pre-fills name in edit mode", () => {
    const category = {
      id: "cat-1",
      userId: "user-1",
      name: "Food",
      icon: "utensils-crossed",
      color: "bg-amber-50 text-amber-700",
      createdAt: "",
      updatedAt: "",
    };

    render(<CategoryForm action={mockAction} category={category} />);

    expect(screen.getAllByDisplayValue("Food").length).toBeGreaterThan(0);
  });

  it("shows validation error for short category name", async () => {
    const user = userEvent.setup();
    render(<CategoryForm action={mockAction} />);

    const nameInput = screen.getAllByPlaceholderText(/category name/i)[0];
    await user.type(nameInput, "a");
    await user.tab();

    expect(screen.getAllByText(/at least 2 characters/i).length).toBeGreaterThan(0);
  });

  it("renders preview section", () => {
    render(<CategoryForm action={mockAction} />);

    expect(screen.getAllByText("Preview").length).toBeGreaterThan(0);
  });

  it("renders icon options", () => {
    render(<CategoryForm action={mockAction} />);

    expect(screen.getAllByRole("button", { name: /food & drink/i }).length).toBeGreaterThan(0);
  });

  it("renders color options", () => {
    render(<CategoryForm action={mockAction} />);

    expect(screen.getAllByRole("button", { name: /amber/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /blue/i }).length).toBeGreaterThan(0);
  });
});
