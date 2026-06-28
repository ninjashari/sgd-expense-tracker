import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripForm } from "../trip-form";

const mockAction = vi.fn().mockResolvedValue(null);

describe("TripForm", () => {
  it("renders all fields", () => {
    render(<TripForm action={mockAction} />);

    expect(screen.getAllByPlaceholderText(/singapore adventure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText(/e\.g\., singapore$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Start Date").length).toBeGreaterThan(0);
    expect(screen.getAllByText("End Date").length).toBeGreaterThan(0);
  });

  it("shows Create Trip button in add mode", () => {
    render(<TripForm action={mockAction} />);

    expect(screen.getAllByRole("button", { name: /create trip/i }).length).toBeGreaterThan(0);
  });

  it("shows Update Trip button in edit mode", () => {
    const trip = {
      id: "trip-1",
      userId: "user-1",
      name: "Singapore",
      destination: "Singapore",
      startDate: "2026-06-28",
      endDate: "2026-07-05",
      createdAt: "",
      updatedAt: "",
    };

    render(<TripForm action={mockAction} trip={trip} />);

    expect(screen.getAllByRole("button", { name: /update trip/i }).length).toBeGreaterThan(0);
  });

  it("pre-fills values in edit mode", () => {
    const trip = {
      id: "trip-1",
      userId: "user-1",
      name: "Singapore Adventure",
      destination: "Singapore",
      startDate: "2026-06-28",
      endDate: "2026-07-05",
      createdAt: "",
      updatedAt: "",
    };

    render(<TripForm action={mockAction} trip={trip} />);

    expect(screen.getAllByDisplayValue("Singapore Adventure").length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue("Singapore").length).toBeGreaterThan(0);
  });

  it("shows validation error for short trip name", async () => {
    const user = userEvent.setup();
    render(<TripForm action={mockAction} />);

    const nameInput = screen.getAllByPlaceholderText(/singapore adventure/i)[0];
    await user.clear(nameInput);
    await user.type(nameInput, "a");
    await user.tab();

    expect(screen.getAllByText(/at least 2 characters/i).length).toBeGreaterThan(0);
  });

  it("shows validation error for short destination", async () => {
    const user = userEvent.setup();
    render(<TripForm action={mockAction} />);

    const destInput = screen.getAllByPlaceholderText(/e\.g\., singapore$/i)[0];
    await user.type(destInput, "a");
    await user.tab();

    expect(screen.getAllByText(/at least 2 characters/i).length).toBeGreaterThan(0);
  });
});
