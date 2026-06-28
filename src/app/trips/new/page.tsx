export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { addTrip } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">New Trip</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <TripForm action={addTrip} />
      </main>
    </div>
  );
}
