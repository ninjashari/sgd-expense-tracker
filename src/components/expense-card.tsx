import Link from "next/link";
import { STATUS_STYLES, ICON_MAP } from "@/lib/constants";
import { formatINR, formatDate } from "@/lib/utils";
import type { Expense } from "@/lib/db/schema";
import { Ellipsis } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  tripId: string;
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function ExpenseCard({
  expense,
  tripId,
  categoriesMap,
}: ExpenseCardProps) {
  const cat = categoriesMap[expense.category] || {
    name: "Other",
    icon: "ellipsis",
    color: "bg-gray-50 text-gray-700",
  };
  const Icon = ICON_MAP[cat.icon] || Ellipsis;
  const statusStyle = STATUS_STYLES[expense.status as "paid" | "planned"];

  return (
    <Link href={`/trips/${tripId}/edit/${expense.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {expense.description}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(expense.date)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm whitespace-nowrap">
                  {formatINR(expense.amount)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}
              >
                {cat.name}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle}`}
              >
                {expense.status}
              </span>
              {expense.paidBy && (
                <span className="text-xs text-gray-400">
                  · {expense.paidBy}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
