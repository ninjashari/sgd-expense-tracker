export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { DeleteButton } from "@/components/delete-button";
import { updateExpense, deleteExpense } from "@/lib/actions";
import {
  getExpenseById,
  getCategoriesForUser,
  getTripById,
  getAvailableCurrencies,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, expenseId } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const [expense, categories, availableCurrencies] = await Promise.all([
    getExpenseById(expenseId, session.user.id),
    getCategoriesForUser(session.user.id),
    trip.foreignCurrency
      ? getAvailableCurrencies(id, session.user.id)
      : Promise.resolve([]),
  ]);
  if (!expense) notFound();
  if (expense.type === "refund") {
    redirect(
      expense.linkedEzlinkTransactionId
        ? `/trips/${id}/ezlink/edit/${expense.linkedEzlinkTransactionId}`
        : `/trips/${id}`
    );
  }

  const boundUpdateAction = updateExpense.bind(null, expenseId, id);
  const boundDeleteAction = deleteExpense.bind(null, expenseId);

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/trips/${id}`}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              Edit Expense
            </h1>
          </div>
          <DeleteButton
            action={boundDeleteAction}
            confirmMessage="Delete this expense?"
          />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <ExpenseForm
          action={boundUpdateAction}
          expense={expense}
          categories={categories}
          foreignCurrency={trip.foreignCurrency}
          availableCurrencies={availableCurrencies}
        />
      </main>
    </div>
  );
}
