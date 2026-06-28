import { formatINR } from "@/lib/utils";

interface SummaryCardsProps {
  totalPaid: number;
  totalPlanned: number;
  total: number;
}

export function SummaryCards({
  totalPaid,
  totalPlanned,
  total,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">Paid</p>
        <p className="text-sm sm:text-lg font-bold text-emerald-600 truncate">
          {formatINR(totalPaid)}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">Planned</p>
        <p className="text-sm sm:text-lg font-bold text-amber-600 truncate">
          {formatINR(totalPlanned)}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
        <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
          {formatINR(total)}
        </p>
      </div>
    </div>
  );
}
