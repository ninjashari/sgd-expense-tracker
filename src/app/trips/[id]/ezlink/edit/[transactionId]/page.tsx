export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EzLinkTopupForm } from "@/components/ezlink-topup-form";
import { EzLinkSpendForm } from "@/components/ezlink-spend-form";
import { EzLinkReturnForm } from "@/components/ezlink-return-form";
import { DeleteButton } from "@/components/delete-button";
import { updateEzLinkTransaction, deleteEzLinkTransaction } from "@/lib/actions";
import {
  getEzLinkTransactionById,
  getTripById,
  getCategoriesForUser,
  getEzLinkBalance,
  getCurrencyPurchaseById,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditEzLinkTransactionPage({
  params,
}: {
  params: Promise<{ id: string; transactionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, transactionId } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const transaction = await getEzLinkTransactionById(
    transactionId,
    session.user.id
  );
  if (!transaction || transaction.tripId !== id) notFound();

  const boundUpdateAction = updateEzLinkTransaction.bind(
    null,
    transactionId,
    id
  );
  const boundDeleteAction = deleteEzLinkTransaction.bind(null, transactionId);

  let categories: Awaited<ReturnType<typeof getCategoriesForUser>> = [];
  let availableBalanceSgd = 0;
  let defaultSource: "notes" | "card" = "notes";
  if (transaction.type === "spend") {
    const [cats, balance] = await Promise.all([
      getCategoriesForUser(session.user.id),
      getEzLinkBalance(id, session.user.id),
    ]);
    categories = cats;
    availableBalanceSgd = balance.balanceSgd + transaction.amountSgd;
  } else if (transaction.type === "return") {
    const [balance, linkedPurchase] = await Promise.all([
      getEzLinkBalance(id, session.user.id),
      transaction.linkedPurchaseId
        ? getCurrencyPurchaseById(transaction.linkedPurchaseId, session.user.id)
        : Promise.resolve(undefined),
    ]);
    availableBalanceSgd = balance.balanceSgd + transaction.amountSgd;
    if (linkedPurchase?.source === "card") defaultSource = "card";
  }

  const title =
    transaction.type === "topup"
      ? "Top Up"
      : transaction.type === "return"
        ? "Return"
        : "Spend";

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/trips/${id}?view=ezlink`}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              Edit {title}
            </h1>
          </div>
          <DeleteButton
            action={boundDeleteAction}
            confirmMessage="Delete this EZ-Link transaction?"
          />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {transaction.type === "topup" ? (
          <EzLinkTopupForm action={boundUpdateAction} transaction={transaction} />
        ) : transaction.type === "return" ? (
          <EzLinkReturnForm
            action={boundUpdateAction}
            transaction={transaction}
            availableBalanceSgd={availableBalanceSgd}
            defaultSource={defaultSource}
          />
        ) : (
          <EzLinkSpendForm
            action={boundUpdateAction}
            transaction={transaction}
            categories={categories}
            availableBalanceSgd={availableBalanceSgd}
          />
        )}
      </main>
    </div>
  );
}
