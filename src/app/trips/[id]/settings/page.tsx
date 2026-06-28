export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { DeleteButton } from "@/components/delete-button";
import { updateTrip, deleteTrip } from "@/lib/actions";
import { getTripById } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function TripSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const trip = await getTripById(id, session.user.id);
  if (!trip) notFound();

  const boundUpdateAction = updateTrip.bind(null, id);
  const boundDeleteAction = deleteTrip.bind(null, id);

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
              Trip Settings
            </h1>
          </div>
          <DeleteButton
            action={boundDeleteAction}
            label="Delete Trip"
            confirmMessage="Delete this trip and all its expenses?"
          />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <TripForm action={boundUpdateAction} trip={trip} />
      </main>
    </div>
  );
}
