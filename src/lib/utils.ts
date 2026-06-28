import { CURRENCIES, type Currency } from "./constants";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, currency: Currency = "INR") {
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${inrFormatter.format(amount)}`;
}

export function formatINR(amount: number) {
  return `₹${inrFormatter.format(amount)}`;
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

export function getMaxDate(status: "paid" | "planned"): string {
  const d = new Date();
  if (status === "planned") {
    d.setMonth(d.getMonth() + 2);
  }
  return d.toISOString().split("T")[0];
}

export function getMinDate(status: "paid" | "planned"): string {
  if (status === "paid") return "";
  return new Date().toISOString().split("T")[0];
}
