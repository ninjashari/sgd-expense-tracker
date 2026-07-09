"use client";

import { useActionState, useState } from "react";
import { todayISO } from "@/lib/utils";
import { validateAmount, validateNotes } from "@/lib/validations";
import type { ActionResult } from "@/lib/action-helpers";
import type { EzLinkTransaction } from "@/lib/db/schema";

interface EzLinkTopupFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  transaction?: EzLinkTransaction;
}

function computeRate(sgdStr: string, inrStr: string): string {
  const sgd = parseFloat(sgdStr);
  const inr = parseFloat(inrStr);
  if (!isNaN(sgd) && sgd > 0 && !isNaN(inr)) {
    return (inr / sgd).toFixed(2);
  }
  return "";
}

export function EzLinkTopupForm({ action, transaction }: EzLinkTopupFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  const [amountSgd, setAmountSgd] = useState(
    transaction?.amountSgd?.toString() || ""
  );
  const [amountInr, setAmountInr] = useState(
    transaction?.amountInr?.toString() || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rate = computeRate(amountSgd, amountInr);

  function validateField(name: string, value: string) {
    let err: string | null = null;
    if (name === "amountSgd" || name === "amountInr") err = validateAmount(value);
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

      <input type="hidden" name="type" value="topup" />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          SGD Amount Loaded
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
          INR Cost
        </label>
        <input
          name="amountInr"
          type="text"
          inputMode="decimal"
          required
          value={amountInr}
          onChange={(e) => setAmountInr(e.target.value)}
          onBlur={(e) => validateField("amountInr", e.target.value)}
          placeholder="0.00"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {(errors.amountInr || fieldErrors?.amountInr) && (
          <p className="text-xs text-red-500 mt-1">
            {errors.amountInr || fieldErrors?.amountInr}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Rate (1 SGD = INR)
        </label>
        <div className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600">
          {rate || "—"}
        </div>
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
          placeholder="Any extra details..."
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
        {isPending ? "Saving..." : transaction ? "Update Top Up" : "Record Top Up"}
      </button>
    </form>
  );
}
