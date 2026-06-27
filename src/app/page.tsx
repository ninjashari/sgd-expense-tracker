import { Suspense } from "react";
import { Header } from "@/components/header";
import { SummaryCards } from "@/components/summary-cards";
import { FilterTabs } from "@/components/filter-tabs";
import { ExpenseList } from "@/components/expense-list";
import { getAllExpenses, getSummary } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const status = params.status as "paid" | "planned" | undefined;
  const validStatus =
    status === "paid" || status === "planned" ? status : undefined;

  const summary = getSummary(session.user.id);
  const expenses = getAllExpenses(session.user.id, validStatus);

  return (
    <div className="min-h-screen pb-8">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <SummaryCards
          totalPaid={summary.totalPaid}
          totalPlanned={summary.totalPlanned}
          total={summary.total}
        />
        <Suspense>
          <FilterTabs />
        </Suspense>
        <ExpenseList expenses={expenses} />
      </main>
    </div>
  );
}
