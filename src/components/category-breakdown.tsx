import { Ellipsis } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { ICON_MAP, hexFromColorClass } from "@/lib/constants";
import { CategoryDonutChart } from "./category-donut-chart";
import type { Expense } from "@/lib/db/schema";

interface CategoryBreakdownProps {
  expenses: Expense[];
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function CategoryBreakdown({
  expenses,
  categoriesMap,
}: CategoryBreakdownProps) {
  const totals: Record<string, number> = {};
  for (const exp of expenses) {
    totals[exp.category] = (totals[exp.category] ?? 0) + exp.amount;
  }

  const breakdown = Object.entries(totals)
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = breakdown.reduce((sum, item) => sum + item.total, 0);

  if (breakdown.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">No expenses yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Add expenses to see category breakdown
        </p>
      </div>
    );
  }

  const chartData = breakdown.map((item) => {
    const cat = categoriesMap[item.categoryId];
    return {
      label: cat?.name ?? "Other",
      value: item.total,
      color: hexFromColorClass(cat?.color ?? "bg-gray-50 text-gray-700"),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <CategoryDonutChart data={chartData} size={160} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {breakdown.map((item) => {
          const cat = categoriesMap[item.categoryId] ?? {
            name: "Other",
            icon: "ellipsis",
            color: "bg-gray-50 text-gray-700",
          };
          const Icon = ICON_MAP[cat.icon] ?? Ellipsis;
          const pct =
            grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0;

          return (
            <div
              key={item.categoryId}
              className="flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}
              >
                <Icon size={16} />
              </div>
              <span className="text-sm text-gray-700 flex-1 truncate">
                {cat.name}
              </span>
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {formatINR(item.total)}
              </span>
              <span className="text-xs text-gray-400 w-10 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
