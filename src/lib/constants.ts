import {
  UtensilsCrossed,
  Bus,
  Hotel,
  ShoppingBag,
  Ticket,
  Plane,
  Stamp,
  Ellipsis,
  Coffee,
  Car,
  Home,
  Camera,
  Star,
  Briefcase,
  Gift,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS = [
  { key: "utensils-crossed", icon: UtensilsCrossed, label: "Food & Drink" },
  { key: "bus", icon: Bus, label: "Bus" },
  { key: "hotel", icon: Hotel, label: "Hotel" },
  { key: "shopping-bag", icon: ShoppingBag, label: "Shopping" },
  { key: "ticket", icon: Ticket, label: "Ticket" },
  { key: "plane", icon: Plane, label: "Plane" },
  { key: "stamp", icon: Stamp, label: "Visa" },
  { key: "ellipsis", icon: Ellipsis, label: "Other" },
  { key: "coffee", icon: Coffee, label: "Coffee" },
  { key: "car", icon: Car, label: "Car" },
  { key: "home", icon: Home, label: "Home" },
  { key: "camera", icon: Camera, label: "Camera" },
  { key: "star", icon: Star, label: "Star" },
  { key: "briefcase", icon: Briefcase, label: "Briefcase" },
  { key: "gift", icon: Gift, label: "Gift" },
  { key: "map-pin", icon: MapPin, label: "Location" },
] as const;

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.key, o.icon])
);

export const COLOR_OPTIONS = [
  { key: "amber", classes: "bg-amber-50 text-amber-700", label: "Amber" },
  { key: "blue", classes: "bg-blue-50 text-blue-700", label: "Blue" },
  { key: "purple", classes: "bg-purple-50 text-purple-700", label: "Purple" },
  { key: "pink", classes: "bg-pink-50 text-pink-700", label: "Pink" },
  { key: "green", classes: "bg-green-50 text-green-700", label: "Green" },
  { key: "gray", classes: "bg-gray-50 text-gray-700", label: "Gray" },
  { key: "red", classes: "bg-red-50 text-red-700", label: "Red" },
  { key: "teal", classes: "bg-teal-50 text-teal-700", label: "Teal" },
  { key: "indigo", classes: "bg-indigo-50 text-indigo-700", label: "Indigo" },
  { key: "orange", classes: "bg-orange-50 text-orange-700", label: "Orange" },
  { key: "sky", classes: "bg-sky-50 text-sky-700", label: "Sky" },
] as const;

export const DEFAULT_CATEGORIES = [
  {
    name: "Food & Drink",
    icon: "utensils-crossed",
    color: "bg-amber-50 text-amber-700",
  },
  { name: "Transport", icon: "bus", color: "bg-blue-50 text-blue-700" },
  {
    name: "Accommodation",
    icon: "hotel",
    color: "bg-purple-50 text-purple-700",
  },
  { name: "Shopping", icon: "shopping-bag", color: "bg-pink-50 text-pink-700" },
  { name: "Attractions", icon: "ticket", color: "bg-green-50 text-green-700" },
  { name: "Travel", icon: "plane", color: "bg-sky-50 text-sky-700" },
  { name: "Visa", icon: "stamp", color: "bg-indigo-50 text-indigo-700" },
  { name: "Other", icon: "ellipsis", color: "bg-gray-50 text-gray-700" },
] as const;

export const CURRENCIES = {
  INR: { label: "INR", symbol: "₹", rate: 1 },
  SGD: { label: "SGD", symbol: "S$", rate: 62.5 },
} as const;

export type Currency = keyof typeof CURRENCIES;

export const STATUS_STYLES = {
  paid: "bg-emerald-50 text-emerald-700",
  planned: "bg-amber-50 text-amber-700",
} as const;

export type Status = "paid" | "planned";
