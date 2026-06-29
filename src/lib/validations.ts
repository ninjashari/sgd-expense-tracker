export function validateDescription(v: string): string | null {
  const trimmed = v?.trim();
  if (!trimmed) return "Description is required";
  if (trimmed.length < 2) return "Description must be at least 2 characters";
  if (trimmed.length > 100) return "Description must be at most 100 characters";
  return null;
}

export function validateAmount(v: string | number): string | null {
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return "Amount must be a valid number";
  if (num <= 0) return "Amount must be greater than 0";
  if (num > 10_000_000) return "Amount must be at most 10,000,000";
  return null;
}

export function validateCategory(v: string, validIds: string[]): string | null {
  if (!v) return "Category is required";
  if (!validIds.includes(v)) return "Invalid category";
  return null;
}

export function validateStatus(v: string): string | null {
  if (v !== "paid" && v !== "planned") return "Status must be paid or planned";
  return null;
}

export function validateExpenseDate(
  date: string,
  status: string
): string | null {
  if (!date) return "Date is required";
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return "Invalid date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (status === "paid") {
    if (d > today) return "Paid expense date cannot be in the future";
  } else if (status === "planned") {
    if (d < today) return "Planned expense date must be today or later";
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 2);
    if (d > maxDate) return "Planned expense date must be within 2 months";
  }
  return null;
}

export function validateNotes(v: string): string | null {
  if (v && v.length > 500) return "Notes must be at most 500 characters";
  return null;
}

export function validateTripName(v: string): string | null {
  const trimmed = v?.trim();
  if (!trimmed) return "Trip name is required";
  if (trimmed.length < 2) return "Trip name must be at least 2 characters";
  if (trimmed.length > 200) return "Trip name must be at most 200 characters";
  return null;
}

export function validateDestination(v: string): string | null {
  const trimmed = v?.trim();
  if (!trimmed) return "Destination is required";
  if (trimmed.length < 2) return "Destination must be at least 2 characters";
  if (trimmed.length > 100)
    return "Destination must be at most 100 characters";
  return null;
}

export function validateTripDates(start: string, end: string): string | null {
  if (!start) return "Start date is required";
  if (!end) return "End date is required";
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (isNaN(s.getTime())) return "Invalid start date";
  if (isNaN(e.getTime())) return "Invalid end date";
  if (e < s) return "End date must be on or after start date";
  return null;
}

export function validateCategoryName(v: string): string | null {
  const trimmed = v?.trim();
  if (!trimmed) return "Category name is required";
  if (trimmed.length < 2)
    return "Category name must be at least 2 characters";
  if (trimmed.length > 30)
    return "Category name must be at most 30 characters";
  return null;
}

export function validateExchangeRate(v: string | number): string | null {
  const num = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(num)) return "Exchange rate must be a valid number";
  if (num <= 0) return "Exchange rate must be greater than 0";
  if (num > 10_000_000) return "Exchange rate seems too high";
  return null;
}

export function validateCurrencySource(v: string): string | null {
  if (v !== "notes" && v !== "card") return "Source must be notes or card";
  return null;
}

export function validatePurchaseType(v: string): string | null {
  if (v !== "buy" && v !== "sell") return "Type must be buy or sell";
  return null;
}

export function validateCurrencyCode(
  v: string,
  validCodes: string[]
): string | null {
  if (!v) return "Currency is required";
  if (!validCodes.includes(v)) return "Invalid currency";
  return null;
}

export function validateUsername(v: string): string | null {
  const trimmed = v?.trim();
  if (!trimmed) return "Username is required";
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  if (trimmed.length > 20) return "Username must be at most 20 characters";
  return null;
}

export function validatePassword(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 6) return "Password must be at least 6 characters";
  return null;
}
