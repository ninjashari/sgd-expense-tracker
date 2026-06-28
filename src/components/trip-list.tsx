import { TripCard } from "./trip-card";
import type { Trip } from "@/lib/db/schema";

export function TripList({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">No trips yet</p>
        <p className="text-gray-300 text-xs mt-1">
          Create your first trip to start tracking expenses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
