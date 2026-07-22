export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EzLinkReturnForm } from "@/components/ezlink-return-form";
import { addEzLinkReturn } from "@/lib/actions";
import { getTripById, getEzLinkBalance } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function AddEzLinkReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const balance = await getEzLinkBalance(id, session.user.id);
  const boundAction = addEzLinkReturn.bind(null, id);

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/trips/${id}?view=ezlink`}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Return EZ-Link Card
          </h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {balance.balanceSgd > 0 ? (
          <EzLinkReturnForm
            action={boundAction}
            availableBalanceSgd={balance.balanceSgd}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              No remaining balance to return
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
