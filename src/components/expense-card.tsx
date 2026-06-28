import Link from "next/link";
import { CATEGORIES, STATUS_STYLES } from "@/lib/constants";
import { formatCurrency, formatINR, formatDate } from "@/lib/utils";
import type { Expense } from "@/lib/db/schema";
import type { Category, Currency } from "@/lib/constants";

export function ExpenseCard({ expense }: { expense: Expense }) {
  const cat = CATEGORIES[expense.category as Category] || CATEGORIES.other;
  const Icon = cat.icon;
  const statusStyle = STATUS_STYLES[expense.status as "paid" | "planned"];

  return (
    <Link href={`/edit/${expense.id}`} className="block">
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
                <p className="font-semibold text-sm">
                  {formatINR(expense.amountInr)}
                </p>
                {expense.currency !== "INR" && (
                  <p className="text-xs text-gray-400">
                    {formatCurrency(expense.amount, expense.currency as Currency)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.color}`}
              >
                {cat.label}
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
