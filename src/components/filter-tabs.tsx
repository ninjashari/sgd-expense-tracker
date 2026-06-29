"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const baseTabs = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Planned", value: "planned" },
  { label: "Categories", value: "categories" },
];

export function FilterTabs({
  basePath = "/",
  showForex = false,
}: {
  basePath?: string;
  showForex?: boolean;
}) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const status = searchParams.get("status") || "";
  const current = view === "categories"
    ? "categories"
    : view === "forex"
      ? "forex"
      : status;

  const tabs = showForex
    ? [...baseTabs, { label: "Forex", value: "forex" }]
    : baseTabs;

  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabs.map((tab) => {
        const href =
          tab.value === "categories"
            ? `${basePath}?view=categories`
            : tab.value === "forex"
              ? `${basePath}?view=forex`
              : tab.value
                ? `${basePath}?status=${tab.value}`
                : basePath;

        return (
          <Link
            key={tab.value}
            href={href}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
              current === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
