import { TripCard } from "./trip-card";
import type { Trip } from "@/lib/db/schema";

interface TripListProps {
  trips: (Trip & { expenseCount: number; totalAmount: number })[];
}

export function TripList({ trips }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">No trips yet</p>
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
