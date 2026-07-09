"use client";

import { useActionState, useState } from "react";
import { ICON_MAP } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import { validateAmount, validateNotes } from "@/lib/validations";
import type { ActionResult } from "@/lib/action-helpers";
import type { EzLinkTransaction, CategoryRecord } from "@/lib/db/schema";
import { Ellipsis } from "lucide-react";
import clsx from "clsx";

interface EzLinkSpendFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  transaction?: EzLinkTransaction;
  categories: CategoryRecord[];
  availableBalanceSgd: number;
}

export function EzLinkSpendForm({
  action,
  transaction,
  categories,
  availableBalanceSgd,
}: EzLinkSpendFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  const [amountSgd, setAmountSgd] = useState(
    transaction?.amountSgd?.toString() || ""
  );
  const [category, setCategory] = useState<string>(
    transaction?.category || categories[0]?.id || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string) {
    let err: string | null = null;
    if (name === "amountSgd") err = validateAmount(value);
    if (name === "notes") err = validateNotes(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <input type="hidden" name="type" value="spend" />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Amount (S$) &middot; Available: S${availableBalanceSgd.toFixed(2)}
        </label>
        <input
          name="amountSgd"
          type="text"
          inputMode="decimal"
          required
          autoFocus
          value={amountSgd}
          onChange={(e) => setAmountSgd(e.target.value)}
          onBlur={(e) => validateField("amountSgd", e.target.value)}
          placeholder="0.00"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {(errors.amountSgd || fieldErrors?.amountSgd) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.amountSgd || fieldErrors?.amountSgd}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Ellipsis;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                  category === cat.id
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-white text-gray-500 shadow-sm hover:shadow"
                )}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="category" value={category} />
        {(errors.category || fieldErrors?.category) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.category || fieldErrors?.category}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Date
        </label>
        <input
          name="date"
          type="date"
          required
          defaultValue={transaction?.date || todayISO()}
          max={todayISO()}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
        />
        {fieldErrors?.date && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.date}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          maxLength={500}
          defaultValue={transaction?.notes || ""}
          placeholder="e.g. Bus 174 to Orchard"
          onBlur={(e) => validateField("notes", e.target.value)}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300 resize-none"
        />
        {(errors.notes || fieldErrors?.notes) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.notes || fieldErrors?.notes}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving..." : transaction ? "Update Spend" : "Log Spend"}
      </button>
    </form>
  );
}
