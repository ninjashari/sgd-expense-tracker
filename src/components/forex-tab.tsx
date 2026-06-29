import Link from "next/link";
import { Plus } from "lucide-react";
import { ForexBalanceCards } from "./forex-balance-cards";
import { ForexTransactionList } from "./forex-transaction-list";
import type { ForexCurrencyBalance, ForexTransaction } from "@/lib/db/queries";

interface ForexTabProps {
  tripId: string;
  balances: ForexCurrencyBalance[];
  transactions: ForexTransaction[];
}

export function ForexTab({ tripId, balances, transactions }: ForexTabProps) {
  return (
    <div className="space-y-4">
      <ForexBalanceCards balances={balances} />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Transactions</h3>
        <Link
          href={`/trips/${tripId}/forex/add`}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus size={14} />
          Exchange
        </Link>
      </div>
      <ForexTransactionList transactions={transactions} tripId={tripId} />
    </div>
  );
}
