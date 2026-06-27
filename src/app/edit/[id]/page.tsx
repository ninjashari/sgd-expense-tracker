export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { DeleteButton } from "@/components/delete-button";
import { updateExpense, deleteExpense } from "@/lib/actions";
import { getExpenseById } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const expense = await getExpenseById(id, session.user.id);
  if (!expense) notFound();

  const updateAction = updateExpense.bind(null, id);
  const deleteAction = deleteExpense.bind(null, id);

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              Edit Expense
            </h1>
          </div>
          <DeleteButton action={deleteAction} />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <ExpenseForm action={updateAction} expense={expense} />
      </main>
    </div>
  );
}
