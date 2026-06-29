import { CURRENCY_MAP } from "./constants";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number) {
  return `₹${inrFormatter.format(amount)}`;
}

const NO_DECIMAL_CURRENCIES = ["JPY", "VND", "IDR", "KRW"];

export function formatCurrency(amount: number, currencyCode: string): string {
  if (currencyCode === "INR") return formatINR(amount);
  const symbol = CURRENCY_MAP[currencyCode]?.symbol ?? currencyCode;
  const decimals = NO_DECIMAL_CURRENCIES.includes(currencyCode) ? 0 : 2;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
