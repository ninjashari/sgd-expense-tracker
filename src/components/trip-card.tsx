import Link from "next/link";
import { MapPin, Calendar, Ellipsis } from "lucide-react";
import { formatDate, formatINR } from "@/lib/utils";
import { ICON_MAP, hexFromColorClass } from "@/lib/constants";
import { CategoryDonutChart } from "./category-donut-chart";
import type { Trip } from "@/lib/db/schema";
import type { CategoryBreakdownItem } from "@/lib/db/queries";

interface TripCardProps {
  trip: Trip;
  total: number;
  categoryBreakdown: CategoryBreakdownItem[];
  categoriesMap: Record<string, { name: string; icon: string; color: string }>;
}

export function TripCard({
  trip,
  total,
  categoryBreakdown,
  categoriesMap,
}: TripCardProps) {
  const sorted = [...categoryBreakdown].sort((a, b) => b.total - a.total);
  const topCategories = sorted.slice(0, 3);
  const remaining = sorted.length - 3;

  const chartData = sorted.map((item) => {
    const cat = categoriesMap[item.categoryId];
    return {
      label: cat?.name ?? "Other",
      value: item.total,
      color: hexFromColorClass(cat?.color ?? "bg-gray-50 text-gray-700"),
    };
  });

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm">{trip.name}</h3>
          {total > 0 && (
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
              {formatINR(total)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
          <MapPin size={12} />
          <span>{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
          <Calendar size={12} />
          <span>
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </span>
        </div>

        {topCategories.length > 0 && (
          <div className="flex items-start gap-3 mt-3 pt-3 border-t border-gray-100">
            <CategoryDonutChart data={chartData} size={64} />
            <div className="flex-1 min-w-0 space-y-1">
              {topCategories.map((item) => {
                const cat = categoriesMap[item.categoryId] ?? {
                  name: "Other",
                  icon: "ellipsis",
                  color: "bg-gray-50 text-gray-700",
                };
                const Icon = ICON_MAP[cat.icon] ?? Ellipsis;
                const pct =
                  total > 0 ? Math.round((item.total / total) * 100) : 0;
                return (
                  <div
                    key={item.categoryId}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${cat.color}`}
                    >
                      <Icon size={10} />
                    </div>
                    <span className="truncate text-gray-600">{cat.name}</span>
                    <span className="ml-auto text-gray-900 font-medium whitespace-nowrap">
                      {formatINR(item.total)}
                    </span>
                    <span className="text-gray-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {remaining > 0 && (
                <p className="text-xs text-gray-300">+{remaining} more</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
