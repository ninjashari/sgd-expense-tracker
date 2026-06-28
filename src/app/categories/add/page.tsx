export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/category-form";
import { addCategory } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/action-helpers";

export default async function AddCategoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  async function addCategoryAndRedirect(
    prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    "use server";
    const result = await addCategory(prev, formData);
    if (result.success) {
      redirect("/categories");
    }
    return result;
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/categories"
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Add Category
          </h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <CategoryForm action={addCategoryAndRedirect} />
      </main>
    </div>
  );
}
