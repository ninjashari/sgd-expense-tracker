"use client";

import { useActionState, useState } from "react";
import { ICON_OPTIONS, ICON_MAP, COLOR_OPTIONS } from "@/lib/constants";
import { validateCategoryName } from "@/lib/validations";
import type { CategoryRecord } from "@/lib/db/schema";
import type { ActionResult } from "@/lib/action-helpers";
import { Ellipsis } from "lucide-react";
import clsx from "clsx";

interface CategoryFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  category?: CategoryRecord;
}

export function CategoryForm({ action, category }: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const stateFieldErrors =
    state && !state.success ? state.fieldErrors : undefined;
  const [icon, setIcon] = useState<string>(category?.icon || ICON_OPTIONS[0].key);
  const [color, setColor] = useState<string>(
    category?.color || COLOR_OPTIONS[0].classes
  );
  const [nameError, setNameError] = useState("");

  const SelectedIcon = ICON_MAP[icon] || Ellipsis;

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <SelectedIcon size={18} />
        </div>
        <span className="text-sm text-gray-400">Preview</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Name
        </label>
        <input
          name="name"
          type="text"
          required
          maxLength={30}
          defaultValue={category?.name}
          placeholder="Category name"
          autoFocus
          onBlur={(e) => {
            const err = validateCategoryName(e.target.value);
            setNameError(err || "");
          }}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {(nameError || stateFieldErrors?.name) && (
          <p className="text-xs text-red-500 mt-1">
            {nameError || stateFieldErrors?.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Icon
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.map((opt) => {
            const I = opt.icon;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setIcon(opt.key)}
                className={clsx(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all",
                  icon === opt.key
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-white text-gray-500 shadow-sm hover:shadow"
                )}
              >
                <I size={16} />
                <span className="truncate w-full text-center text-[10px]">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="icon" value={icon} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setColor(opt.classes)}
              className={clsx(
                "px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                color === opt.classes
                  ? "ring-2 ring-gray-900 ring-offset-1"
                  : "",
                opt.classes
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="color" value={color} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : category
            ? "Update Category"
            : "Create Category"}
      </button>
    </form>
  );
}
