import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { formatDate, formatINR } from "@/lib/utils";
import type { Trip } from "@/lib/db/schema";

interface TripCardProps {
  trip: Trip;
  total: number;
}

export function TripCard({ trip, total }: TripCardProps) {
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
      </div>
    </Link>
  );
}
