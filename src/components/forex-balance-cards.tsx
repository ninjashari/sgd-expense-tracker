import { formatCurrency, formatINR } from "@/lib/utils";
import { CURRENCY_MAP } from "@/lib/constants";
import type { ForexCurrencyBalance } from "@/lib/db/queries";

interface ForexBalanceCardsProps {
  balances: ForexCurrencyBalance[];
}

export function ForexBalanceCards({ balances }: ForexBalanceCardsProps) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No currency exchanges yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Record an exchange to track balances
        </p>
      </div>
    );
  }

  const totalInrInvested = balances.reduce((s, b) => s + b.inrCost, 0);

  return (
    <div className="space-y-3">
      {balances.map((bal) => {
        const currencyInfo = CURRENCY_MAP[bal.currency];
        const name = currencyInfo?.name ?? bal.currency;

        return (
          <div
            key={bal.currency}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">{bal.currency}</p>
                <p className="text-xs text-gray-400">{name}</p>
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(bal.totalBalance, bal.currency)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-green-600 font-medium">
                  Cash (Notes)
                </p>
                <p className="text-sm font-semibold text-green-700">
                  {formatCurrency(bal.notesBalance, bal.currency)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-blue-600 font-medium">
                  Forex Card
                </p>
                <p className="text-sm font-semibold text-blue-700">
                  {formatCurrency(bal.cardBalance, bal.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Avg rate: 1 {bal.currency} ={" "}
                {bal.cumulativeRate > 0
                  ? formatINR(bal.cumulativeRate)
                  : "—"}
              </span>
              <span>INR invested: {formatINR(bal.inrCost)}</span>
            </div>
          </div>
        );
      })}

      <div className="bg-gray-50 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-400">Total INR Invested</p>
        <p className="text-lg font-bold text-gray-900">
          {formatINR(totalInrInvested)}
        </p>
      </div>
    </div>
  );
}
