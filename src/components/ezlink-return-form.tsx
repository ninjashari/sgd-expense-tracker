"use client";

import { useActionState, useState } from "react";
import { CURRENCY_SOURCE_STYLES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import { validateAmount, validateNotes } from "@/lib/validations";
import type { ActionResult } from "@/lib/action-helpers";
import type { EzLinkTransaction } from "@/lib/db/schema";
import clsx from "clsx";

interface EzLinkReturnFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  transaction?: EzLinkTransaction;
  availableBalanceSgd: number;
  defaultSource?: "notes" | "card";
}

export function EzLinkReturnForm({
  action,
  transaction,
  availableBalanceSgd,
  defaultSource = "notes",
}: EzLinkReturnFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  const [amountSgd, setAmountSgd] = useState(
    transaction?.amountSgd?.toString() || ""
  );
  const [source, setSource] = useState<"notes" | "card">(defaultSource);
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
          Refund to (Forex)
        </label>
        <div className="flex gap-2">
          {(["notes", "card"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                source === s
                  ? CURRENCY_SOURCE_STYLES[s] +
                    " shadow-md ring-2 ring-offset-1 ring-gray-900"
                  : "bg-white text-gray-400 shadow-sm hover:shadow"
              )}
            >
              {s === "notes" ? "Cash (Notes)" : "Forex Card"}
            </button>
          ))}
        </div>
        <input type="hidden" name="source" value={source} />
        {fieldErrors?.source && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.source}</p>
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
          placeholder="e.g. Returned card at Changi Airport"
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
        {isPending ? "Saving..." : transaction ? "Update Return" : "Log Return"}
      </button>
    </form>
  );
}
