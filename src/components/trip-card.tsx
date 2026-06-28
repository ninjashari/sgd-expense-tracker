import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Trip } from "@/lib/db/schema";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-sm">{trip.name}</h3>
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
