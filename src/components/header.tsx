import Link from "next/link";
import { Plus, LogOut, ArrowLeft, Settings } from "lucide-react";
import { signOut } from "@/lib/auth";

interface HeaderProps {
  actionHref?: string;
  actionLabel?: string;
  backHref?: string;
  title?: string;
}

export function Header({
  actionHref,
  actionLabel = "Add",
  backHref,
  title = "TripKharcha",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
          )}
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!backHref && (
            <Link
              href="/categories"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Manage Categories"
            >
              <Settings size={18} />
            </Link>
          )}
          {actionHref && (
            <Link
              href={actionHref}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              {actionLabel}
            </Link>
          )}
          {!backHref && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
