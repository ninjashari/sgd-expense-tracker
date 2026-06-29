export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CurrencyPurchaseForm } from "@/components/currency-purchase-form";
import { DeleteButton } from "@/components/delete-button";
import {
  updateCurrencyPurchase,
  deleteCurrencyPurchase,
} from "@/lib/actions";
import { getCurrencyPurchaseById, getTripById } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditForexPage({
  params,
}: {
  params: Promise<{ id: string; purchaseId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, purchaseId } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const purchase = await getCurrencyPurchaseById(purchaseId, session.user.id);
  if (!purchase) notFound();

  const boundUpdateAction = updateCurrencyPurchase.bind(
    null,
    purchaseId,
    id
  );
  const boundDeleteAction = deleteCurrencyPurchase.bind(null, purchaseId);

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/trips/${id}?view=forex`}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              Edit Exchange
            </h1>
          </div>
          <DeleteButton
            action={boundDeleteAction}
            confirmMessage="Delete this exchange?"
          />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <CurrencyPurchaseForm
          action={boundUpdateAction}
          purchase={purchase}
        />
      </main>
    </div>
  );
}
