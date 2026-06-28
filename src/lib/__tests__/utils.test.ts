import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatINR,
  formatDate,
  convertToINR,
  todayISO,
  getMaxDate,
  getMinDate,
} from "../utils";

describe("formatCurrency", () => {
  it("formats INR", () => {
    expect(formatCurrency(100, "INR")).toBe("₹100.00");
  });

  it("formats SGD", () => {
    expect(formatCurrency(15, "SGD")).toBe("S$15.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₹0.00");
  });

  it("formats decimals", () => {
    expect(formatCurrency(99.9, "INR")).toBe("₹99.90");
  });
});

describe("formatINR", () => {
  it("formats amount with rupee symbol", () => {
    expect(formatINR(937.5)).toBe("₹937.50");
  });

  it("formats zero", () => {
    expect(formatINR(0)).toBe("₹0.00");
  });

  it("formats large amounts with Indian grouping", () => {
    expect(formatINR(1000000)).toBe("₹10,00,000.00");
  });
});

describe("formatDate", () => {
  it("formats ISO date to en-IN locale", () => {
    const result = formatDate("2026-06-28");
    expect(result).toMatch(/28/);
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2026/);
  });
});

describe("convertToINR", () => {
  it("returns same amount for INR", () => {
    expect(convertToINR(100, "INR")).toBe(100);
  });

  it("converts SGD to INR", () => {
    expect(convertToINR(10, "SGD")).toBe(625);
  });

  it("rounds to 2 decimal places", () => {
    expect(convertToINR(1.111, "SGD")).toBe(69.44);
  });

  it("handles zero", () => {
    expect(convertToINR(0, "SGD")).toBe(0);
  });
});

describe("todayISO", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns today's date", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(todayISO()).toBe(today);
  });
});

describe("getMaxDate", () => {
  it("returns today for paid", () => {
    expect(getMaxDate("paid")).toBe(todayISO());
  });

  it("returns today+2months for planned", () => {
    const result = getMaxDate("planned");
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    expect(result).toBe(d.toISOString().split("T")[0]);
  });
});

describe("getMinDate", () => {
  it("returns empty string for paid", () => {
    expect(getMinDate("paid")).toBe("");
  });

  it("returns today for planned", () => {
    expect(getMinDate("planned")).toBe(todayISO());
  });
});
