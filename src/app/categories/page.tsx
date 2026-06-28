export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { CategoryList } from "@/components/category-list";
import { getCategoriesForUser } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await getCategoriesForUser(session.user.id);

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
            <h1 className="text-lg font-semibold tracking-tight">Categories</h1>
          </div>
          <Link
            href="/categories/add"
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Add
          </Link>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <CategoryList categories={categories} />
      </main>
    </div>
  );
}
