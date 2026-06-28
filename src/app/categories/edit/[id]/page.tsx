export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/category-form";
import { DeleteButton } from "@/components/delete-button";
import { updateCategory, deleteCategory } from "@/lib/actions";
import { getCategoryById } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const category = await getCategoryById(id, session.user.id);
  if (!category) notFound();

  const boundUpdateAction = updateCategory.bind(null, id);
  const boundDeleteAction = deleteCategory.bind(null, id);

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/categories"
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              Edit Category
            </h1>
          </div>
          <DeleteButton
            action={boundDeleteAction}
            confirmMessage="Delete this category?"
          />
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <CategoryForm action={boundUpdateAction} category={category} />
      </main>
    </div>
  );
}
