import Link from "next/link";
import { Plus } from "lucide-react";
import { EzLinkBalanceCard } from "./ezlink-balance-card";
import { EzLinkTransactionList } from "./ezlink-transaction-list";
import type { EzLinkBalance } from "@/lib/db/queries";
import type { EzLinkTransaction } from "@/lib/db/schema";

interface EzLinkTabProps {
  tripId: string;
  balance: EzLinkBalance;
  transactions: EzLinkTransaction[];
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function EzLinkTab({
  tripId,
  balance,
  transactions,
  categoriesMap,
}: EzLinkTabProps) {
  return (
    <div className="space-y-4">
      <EzLinkBalanceCard balance={balance} />
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/trips/${tripId}/ezlink/topup`}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus size={14} />
          Top Up
        </Link>
        <Link
          href={`/trips/${tripId}/ezlink/spend`}
          className="flex items-center justify-center gap-1.5 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus size={14} />
          Log Spend
        </Link>
      </div>
      <h3 className="text-sm font-semibold text-gray-700">Transactions</h3>
      <EzLinkTransactionList
        transactions={transactions}
        tripId={tripId}
        categoriesMap={categoriesMap}
      />
    </div>
  );
}
