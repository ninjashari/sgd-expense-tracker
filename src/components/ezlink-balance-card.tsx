import { formatCurrency, formatINR } from "@/lib/utils";
import type { EzLinkBalance } from "@/lib/db/queries";
import clsx from "clsx";

interface EzLinkBalanceCardProps {
  balance: EzLinkBalance;
}

export function EzLinkBalanceCard({ balance }: EzLinkBalanceCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold">EZ-Link Card</p>
          <p className="text-xs text-gray-400">Stored value balance</p>
        </div>
        <p className="text-lg font-bold">
          {formatCurrency(balance.balanceSgd, "SGD")}
        </p>
      </div>
      <div
        className={clsx(
          "grid gap-3 mb-3",
          balance.totalReturnedSgd > 0 ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        <div className="bg-emerald-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-emerald-600 font-medium">
            Total Topped Up
          </p>
          <p className="text-sm font-semibold text-emerald-700">
            {formatCurrency(balance.totalToppedUpSgd, "SGD")}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-red-600 font-medium">Total Spent</p>
          <p className="text-sm font-semibold text-red-700">
            {formatCurrency(balance.totalSpentSgd, "SGD")}
          </p>
        </div>
        {balance.totalReturnedSgd > 0 && (
          <div className="bg-amber-50 rounded-xl px-3 py-2">
            <p className="text-[10px] text-amber-600 font-medium">
              Total Returned
            </p>
            <p className="text-sm font-semibold text-amber-700">
              {formatCurrency(balance.totalReturnedSgd, "SGD")}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Avg rate: 1 SGD ={" "}
          {balance.cumulativeRate > 0 ? formatINR(balance.cumulativeRate) : "—"}
        </span>
        <span>Balance value: {formatINR(balance.inrCost)}</span>
      </div>
    </div>
  );
}
