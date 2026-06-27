import {
  UtensilsCrossed,
  Bus,
  Hotel,
  ShoppingBag,
  Ticket,
  Ellipsis,
} from "lucide-react";

export const CATEGORIES = {
  food: {
    label: "Food & Drink",
    icon: UtensilsCrossed,
    color: "bg-amber-50 text-amber-700",
  },
  transport: {
    label: "Transport",
    icon: Bus,
    color: "bg-blue-50 text-blue-700",
  },
  accommodation: {
    label: "Accommodation",
    icon: Hotel,
    color: "bg-purple-50 text-purple-700",
  },
  shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "bg-pink-50 text-pink-700",
  },
  attractions: {
    label: "Attractions",
    icon: Ticket,
    color: "bg-green-50 text-green-700",
  },
  other: {
    label: "Other",
    icon: Ellipsis,
    color: "bg-gray-50 text-gray-700",
  },
} as const;

export type Category = keyof typeof CATEGORIES;

export const CURRENCIES = {
  SGD: { label: "SGD", symbol: "S$", rate: 1 },
  INR: { label: "INR", symbol: "₹", rate: 0.016 },
} as const;

export type Currency = keyof typeof CURRENCIES;

export const STATUS_STYLES = {
  paid: "bg-emerald-50 text-emerald-700",
  planned: "bg-amber-50 text-amber-700",
} as const;

export type Status = "paid" | "planned";
