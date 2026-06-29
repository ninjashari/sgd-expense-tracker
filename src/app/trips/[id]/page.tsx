export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Header } from "@/components/header";
import { SummaryCards } from "@/components/summary-cards";
import { FilterTabs } from "@/components/filter-tabs";
import { ExpenseList } from "@/components/expense-list";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { ImportButton } from "@/components/import-button";
import {
  getAllExpenses,
  getTripById,
  getTripSummary,
  getCategoriesForUser,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function TripDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const sp = await searchParams;
  const isCategoryView = sp.view === "categories";
  const status = sp.status as "paid" | "planned" | undefined;
  const validStatus =
    status === "paid" || status === "planned" ? status : undefined;

  const [summary, expenseList, userCategories] = await Promise.all([
    getTripSummary(id, session.user.id),
    getAllExpenses(session.user.id, id, isCategoryView ? undefined : validStatus),
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
      <Header
        title={trip.name}
        backHref="/"
        actionHref={`/trips/${id}/add`}
        actionLabel="Add"
      />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{trip.destination}</p>
          </div>
          <div className="flex items-center gap-3">
            <ImportButton tripId={id} categories={userCategories} />
            <a
              href={`/trips/${id}/settings`}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Edit Trip
            </a>
          </div>
        </div>
        <SummaryCards
          totalPaid={summary.totalPaid}
          totalPlanned={summary.totalPlanned}
          total={summary.total}
        />
        <Suspense>
          <FilterTabs basePath={`/trips/${id}`} />
        </Suspense>
        {isCategoryView ? (
          <CategoryBreakdown
            expenses={expenseList}
            categoriesMap={categoriesMap}
          />
        ) : (
          <ExpenseList
            expenses={expenseList}
            tripId={id}
            categoriesMap={categoriesMap}
          />
        )}
      </main>
    </div>
  );
}
