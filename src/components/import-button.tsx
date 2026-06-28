"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { ImportDrawer } from "./import-drawer";

export function ImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
      >
        <Upload size={16} />
        Import
      </button>
      <ImportDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
