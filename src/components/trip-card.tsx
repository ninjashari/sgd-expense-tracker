import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import type { Trip } from "@/lib/db/schema";

interface TripCardProps {
  trip: Trip & { expenseCount: number; totalAmount: number };
}

export function TripCard({ trip }: TripCardProps) {
  const dateRange =
    trip.startDate && trip.endDate
      ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
      : trip.startDate
        ? formatDate(trip.startDate)
        : null;

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-sky-50 text-sky-700">
            <MapPin size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{trip.name}</p>
                {dateRange && (
                  <p className="text-xs text-gray-400 mt-0.5">{dateRange}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">
                  {formatINR(trip.totalAmount)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}
              </span>
              {trip.description && (
                <span className="text-xs text-gray-400 truncate">
                  {trip.description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
