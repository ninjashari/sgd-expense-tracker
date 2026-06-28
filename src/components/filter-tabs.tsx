"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { label: "All", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Planned", value: "planned" },
];

export function FilterTabs({ basePath = "/" }: { basePath?: string }) {
  const searchParams = useSearchParams();
  const current = searchParams.get("status") || "";

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={
            tab.value
              ? `${basePath}?status=${tab.value}`
              : basePath
          }
          className={clsx(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            current === tab.value
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
