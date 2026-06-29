export const dynamic = "force-dynamic";

import { Header } from "@/components/header";
import { TripList } from "@/components/trip-list";
import {
  getTripsForUser,
  getAllTripsTotals,
  getAllTripsCategoryBreakdown,
  getCategoriesForUser,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [trips, tripTotals, tripCategoryBreakdowns, userCategories] =
    await Promise.all([
      getTripsForUser(session.user.id),
      getAllTripsTotals(session.user.id),
      getAllTripsCategoryBreakdown(session.user.id),
      getCategoriesForUser(session.user.id),
    ]);

  const categoriesMap: Record<
    string,
    { name: string; icon: string; color: string }
  > = {};
  for (const cat of userCategories) {
    categoriesMap[cat.id] = {
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    };
  }

  return (
    <div className="min-h-screen pb-8">
      <Header actionHref="/trips/new" actionLabel="New Trip" />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <TripList
          trips={trips}
          tripTotals={tripTotals}
          tripCategoryBreakdowns={tripCategoryBreakdowns}
          categoriesMap={categoriesMap}
        />
      </main>
    </div>
  );
}
