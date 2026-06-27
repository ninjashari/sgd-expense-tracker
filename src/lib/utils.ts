import { CURRENCIES, type Currency } from "./constants";

export function formatCurrency(amount: number, currency: Currency = "INR") {
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatINR(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function convertToINR(amount: number, currency: Currency): number {
  const rate = CURRENCIES[currency].rate;
  return Math.round(amount * rate * 100) / 100;
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}
