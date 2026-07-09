import Link from "next/link";
import { ICON_MAP, EZLINK_STYLES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EzLinkTransaction } from "@/lib/db/schema";
import { Ellipsis, Bus, Banknote } from "lucide-react";
import clsx from "clsx";

interface EzLinkTransactionListProps {
  transactions: EzLinkTransaction[];
  tripId: string;
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function EzLinkTransactionList({
  transactions,
  tripId,
  categoriesMap,
}: EzLinkTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No EZ-Link transactions yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Top up the card or log a spend to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isTopup = tx.type === "topup";
        const cat = tx.category ? categoriesMap[tx.category] : undefined;
        const Icon = isTopup ? Banknote : cat ? ICON_MAP[cat.icon] || Ellipsis : Bus;
        const avatarColor = isTopup
          ? "bg-emerald-50 text-emerald-700"
          : cat?.color || "bg-gray-50 text-gray-700";

        return (
          <Link
            key={tx.id}
            href={`/trips/${tripId}/ezlink/edit/${tx.id}`}
            className="block"
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    avatarColor
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {isTopup ? "EZ-Link Top Up" : cat?.name || "Card Spend"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <p
                      className={clsx(
                        "font-semibold text-sm whitespace-nowrap shrink-0",
                        isTopup ? "text-emerald-700" : "text-red-600"
                      )}
                    >
                      {isTopup ? "+" : "-"}
                      {formatCurrency(tx.amountSgd, "SGD")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                        EZLINK_STYLES[tx.type as "topup" | "spend"]
                      )}
                    >
                      {tx.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
