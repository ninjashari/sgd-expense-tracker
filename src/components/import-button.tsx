"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { ImportDrawer } from "./import-drawer";
import type { CategoryRecord } from "@/lib/db/schema";

export function ImportButton({ tripId, categories }: { tripId: string; categories: CategoryRecord[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Import</span>
      </button>
      <ImportDrawer open={open} onClose={() => setOpen(false)} tripId={tripId} categories={categories} />
    </>
  );
}
