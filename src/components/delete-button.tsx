"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { ActionResult } from "@/lib/action-helpers";

interface DeleteButtonProps {
  action: () => Promise<void | ActionResult>;
  label?: string;
  confirmMessage?: string;
}

export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this?",
}: DeleteButtonProps) {
  const [error, setError] = useState("");

  return (
    <div>
      <form
        action={async () => {
          if (!confirm(confirmMessage)) return;
          const result = await action();
          if (result && !result.success) {
            setError(result.error);
          }
        }}
      >
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors py-2"
        >
          <Trash2 size={14} />
          {label}
        </button>
      </form>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
