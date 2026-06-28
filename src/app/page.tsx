export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/header";
import { SummaryCards } from "@/components/summary-cards";
import { TripList } from "@/components/trip-list";
import { getAllTrips, getSummary } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [summary, tripList] = await Promise.all([
    getSummary(session.user.id),
    getAllTrips(session.user.id),
  ]);

  return (
    <div className="min-h-screen pb-8">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <SummaryCards
          totalPaid={summary.totalPaid}
          totalPlanned={summary.totalPlanned}
          total={summary.total}
        />
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Your Trips</h2>
          <Link
            href="/trips/new"
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus size={14} />
            New Trip
          </Link>
        </div>
        <TripList trips={tripList} />
      </main>
    </div>
  );
}
