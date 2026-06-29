import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ForexTransaction } from "@/lib/db/queries";
import clsx from "clsx";

interface ForexTransactionListProps {
  transactions: ForexTransaction[];
  tripId: string;
}

export function ForexTransactionList({
  transactions,
  tripId,
}: ForexTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isBuy = tx.type === "buy";
        const isSell = tx.type === "sell";
        const isExpense = tx.type === "expense";

        const href = isExpense
          ? `/trips/${tripId}/edit/${tx.id}`
          : `/trips/${tripId}/forex/edit/${tx.id}`;

        let description: string;
        if (isExpense) {
          description = tx.description;
        } else if (isBuy) {
          description = `Bought ${formatCurrency(tx.toAmount, tx.toCurrency)}`;
        } else {
          description = `Sold ${formatCurrency(tx.fromAmount, tx.fromCurrency)}`;
        }

        return (
          <Link key={tx.id} href={href} className="block">
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {formatDate(tx.date)}
                    </span>
                    <span
                      className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                        isBuy && "bg-emerald-50 text-emerald-700",
                        isSell && "bg-amber-50 text-amber-700",
                        isExpense && "bg-red-50 text-red-700"
                      )}
                    >
                      {tx.type}
                    </span>
                    <span
                      className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                        tx.source === "card"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                      )}
                    >
                      {tx.source === "card" ? "Card" : "Notes"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={clsx(
                      "text-sm font-semibold",
                      isBuy && "text-emerald-700",
                      isSell && "text-amber-700",
                      isExpense && "text-red-600"
                    )}
                  >
                    {isExpense ? "-" : ""}
                    {formatCurrency(
                      isExpense ? tx.fromAmount : tx.fromAmount,
                      tx.fromCurrency
                    )}
                  </p>
                  {!isExpense && (
                    <p className="text-xs text-gray-400">
                      → {formatCurrency(tx.toAmount, tx.toCurrency)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
