export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Header } from "@/components/header";
import { SummaryCards } from "@/components/summary-cards";
import { FilterTabs } from "@/components/filter-tabs";
import { ExpenseList } from "@/components/expense-list";
import { getAllExpenses, getSummary, getTripById } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const sp = await searchParams;
  const status = sp.status as "paid" | "planned" | undefined;
  const validStatus =
    status === "paid" || status === "planned" ? status : undefined;

  const [summary, expenseList] = await Promise.all([
    getSummary(session.user.id, id),
    getAllExpenses(session.user.id, validStatus, id),
  ]);

  return (
    <div className="min-h-screen pb-8">
      <Header tripId={id} tripName={trip.name} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <SummaryCards
          totalPaid={summary.totalPaid}
          totalPlanned={summary.totalPlanned}
          total={summary.total}
        />
        <Suspense>
          <FilterTabs />
        </Suspense>
        <ExpenseList expenses={expenseList} />
      </main>
    </div>
  );
}
