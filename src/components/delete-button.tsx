"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({ action, label = "expense" }: { action: () => Promise<void>; label?: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete this ${label}?`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors py-2"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </form>
  );
}
