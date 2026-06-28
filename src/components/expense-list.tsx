import { ExpenseCard } from "./expense-card";
import type { Expense } from "@/lib/db/schema";

interface ExpenseListProps {
  expenses: Expense[];
  tripId: string;
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function ExpenseList({
  expenses,
  tripId,
  categoriesMap,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">No expenses yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Tap &quot;Add&quot; to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          tripId={tripId}
          categoriesMap={categoriesMap}
        />
      ))}
    </div>
  );
}
