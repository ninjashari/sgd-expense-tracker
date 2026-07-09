import { describe, it, expect } from "vitest";
import {
  validateDescription,
  validateAmount,
  validateCategory,
  validateStatus,
  validateExpenseDate,
  validateNotes,
  validateTripName,
  validateDestination,
  validateTripDates,
  validateCategoryName,
  validateUsername,
  validatePassword,
  validateEzLinkType,
} from "../validations";

describe("validateDescription", () => {
  it("returns null for valid input", () => {
    expect(validateDescription("Lunch")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateDescription("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validateDescription("a")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateDescription("x".repeat(101))).not.toBeNull();
  });

  it("accepts boundary (2 chars)", () => {
    expect(validateDescription("ab")).toBeNull();
  });

  it("accepts boundary (100 chars)", () => {
    expect(validateDescription("x".repeat(100))).toBeNull();
  });
});

describe("validateAmount", () => {
  it("accepts valid number", () => {
    expect(validateAmount("50")).toBeNull();
    expect(validateAmount(50)).toBeNull();
  });

  it("rejects zero", () => {
    expect(validateAmount("0")).not.toBeNull();
  });

  it("rejects negative", () => {
    expect(validateAmount("-5")).not.toBeNull();
  });

  it("rejects NaN", () => {
    expect(validateAmount("abc")).not.toBeNull();
  });

  it("rejects too large", () => {
    expect(validateAmount("10000001")).not.toBeNull();
  });

  it("accepts max boundary", () => {
    expect(validateAmount("10000000")).toBeNull();
  });

  it("accepts decimal", () => {
    expect(validateAmount("99.99")).toBeNull();
  });
});

describe("validateCategory", () => {
  const validIds = ["cat-1", "cat-2", "cat-3"];

  it("accepts valid category", () => {
    expect(validateCategory("cat-1", validIds)).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateCategory("", validIds)).not.toBeNull();
  });

  it("rejects invalid", () => {
    expect(validateCategory("cat-999", validIds)).not.toBeNull();
  });
});

describe("validateStatus", () => {
  it("accepts paid", () => {
    expect(validateStatus("paid")).toBeNull();
  });

  it("accepts planned", () => {
    expect(validateStatus("planned")).toBeNull();
  });

  it("rejects other values", () => {
    expect(validateStatus("unknown")).not.toBeNull();
    expect(validateStatus("")).not.toBeNull();
  });
});

describe("validateExpenseDate", () => {
  const today = new Date().toISOString().split("T")[0];

  it("rejects empty", () => {
    expect(validateExpenseDate("", "paid")).not.toBeNull();
  });

  it("rejects invalid date", () => {
    expect(validateExpenseDate("not-a-date", "paid")).not.toBeNull();
  });

  it("paid: accepts today", () => {
    expect(validateExpenseDate(today, "paid")).toBeNull();
  });

  it("paid: accepts past date", () => {
    expect(validateExpenseDate("2025-01-01", "paid")).toBeNull();
  });

  it("paid: rejects future date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const futureStr = future.toISOString().split("T")[0];
    expect(validateExpenseDate(futureStr, "paid")).not.toBeNull();
  });

  it("planned: accepts today", () => {
    expect(validateExpenseDate(today, "planned")).toBeNull();
  });

  it("planned: rejects past date", () => {
    expect(validateExpenseDate("2025-01-01", "planned")).not.toBeNull();
  });

  it("planned: accepts date within 2 months", () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const dateStr = d.toISOString().split("T")[0];
    expect(validateExpenseDate(dateStr, "planned")).toBeNull();
  });

  it("planned: rejects date beyond 2 months", () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    const dateStr = d.toISOString().split("T")[0];
    expect(validateExpenseDate(dateStr, "planned")).not.toBeNull();
  });
});

describe("validateNotes", () => {
  it("accepts empty", () => {
    expect(validateNotes("")).toBeNull();
  });

  it("accepts valid text", () => {
    expect(validateNotes("Some notes here")).toBeNull();
  });

  it("rejects too long", () => {
    expect(validateNotes("x".repeat(501))).not.toBeNull();
  });

  it("accepts boundary (500 chars)", () => {
    expect(validateNotes("x".repeat(500))).toBeNull();
  });
});

describe("validateTripName", () => {
  it("accepts valid name", () => {
    expect(validateTripName("Singapore Trip")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateTripName("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validateTripName("a")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateTripName("x".repeat(201))).not.toBeNull();
  });

  it("accepts boundary (200 chars)", () => {
    expect(validateTripName("x".repeat(200))).toBeNull();
  });
});

describe("validateDestination", () => {
  it("accepts valid destination", () => {
    expect(validateDestination("Singapore")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateDestination("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validateDestination("a")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateDestination("x".repeat(101))).not.toBeNull();
  });
});

describe("validateTripDates", () => {
  it("accepts valid range", () => {
    expect(validateTripDates("2026-06-01", "2026-06-10")).toBeNull();
  });

  it("accepts same date", () => {
    expect(validateTripDates("2026-06-01", "2026-06-01")).toBeNull();
  });

  it("rejects end before start", () => {
    expect(validateTripDates("2026-06-10", "2026-06-01")).not.toBeNull();
  });

  it("rejects empty start", () => {
    expect(validateTripDates("", "2026-06-10")).not.toBeNull();
  });

  it("rejects empty end", () => {
    expect(validateTripDates("2026-06-01", "")).not.toBeNull();
  });
});

describe("validateCategoryName", () => {
  it("accepts valid name", () => {
    expect(validateCategoryName("Food")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateCategoryName("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validateCategoryName("a")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateCategoryName("x".repeat(31))).not.toBeNull();
  });
});

describe("validateUsername", () => {
  it("accepts valid username", () => {
    expect(validateUsername("john")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validateUsername("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validateUsername("ab")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateUsername("x".repeat(21))).not.toBeNull();
  });

  it("accepts boundary (3 chars)", () => {
    expect(validateUsername("abc")).toBeNull();
  });

  it("accepts boundary (20 chars)", () => {
    expect(validateUsername("x".repeat(20))).toBeNull();
  });
});

describe("validatePassword", () => {
  it("accepts valid password", () => {
    expect(validatePassword("secret123")).toBeNull();
  });

  it("rejects empty", () => {
    expect(validatePassword("")).not.toBeNull();
  });

  it("rejects too short", () => {
    expect(validatePassword("12345")).not.toBeNull();
  });

  it("accepts boundary (6 chars)", () => {
    expect(validatePassword("123456")).toBeNull();
  });
});

describe("validateEzLinkType", () => {
  it("accepts topup", () => {
    expect(validateEzLinkType("topup")).toBeNull();
  });

  it("accepts spend", () => {
    expect(validateEzLinkType("spend")).toBeNull();
  });

  it("rejects other values", () => {
    expect(validateEzLinkType("buy")).not.toBeNull();
    expect(validateEzLinkType("")).not.toBeNull();
  });
});
