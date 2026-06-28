import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterTabs } from "../filter-tabs";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

describe("FilterTabs", () => {
  it("renders all three tabs", () => {
    render(<FilterTabs />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  it("uses default basePath for links", () => {
    render(<FilterTabs />);

    const links = screen.getAllByRole("link");
    const paidLink = links.find((l) => l.textContent === "Paid");
    expect(paidLink).toHaveAttribute("href", "/?status=paid");

    const allLink = links.find((l) => l.textContent === "All");
    expect(allLink).toHaveAttribute("href", "/");
  });

  it("uses custom basePath for trip-scoped links", () => {
    const { unmount } = render(<FilterTabs basePath="/trips/abc" />);

    const links = screen.getAllByRole("link");
    const paidLinks = links.filter((l) => l.textContent === "Paid");
    const paidWithBasePath = paidLinks.find(
      (l) => l.getAttribute("href") === "/trips/abc?status=paid"
    );
    expect(paidWithBasePath).toBeTruthy();

    const allLinks = links.filter((l) => l.textContent === "All");
    const allWithBasePath = allLinks.find(
      (l) => l.getAttribute("href") === "/trips/abc"
    );
    expect(allWithBasePath).toBeTruthy();

    unmount();
  });
});
