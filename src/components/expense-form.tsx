"use client";

import { useActionState } from "react";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { todayISO, convertToSGD, formatSGD } from "@/lib/utils";
import type { Expense } from "@/lib/db/schema";
import type { Category, Currency } from "@/lib/constants";
import { useState } from "react";
import clsx from "clsx";

interface ExpenseFormProps {
  action: (formData: FormData) => Promise<void>;
  expense?: Expense;
}

export function ExpenseForm({ action, expense }: ExpenseFormProps) {
  const [category, setCategory] = useState<string>(
    expense?.category || "food"
  );
  const [status, setStatus] = useState<string>(expense?.status || "planned");
  const [currency, setCurrency] = useState<Currency>(
    (expense?.currency as Currency) || "SGD"
  );
  const [amount, setAmount] = useState(
    expense?.amount?.toString() || ""
  );

  const sgdPreview =
    currency !== "SGD" && amount
      ? convertToSGD(parseFloat(amount) || 0, currency)
      : null;

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Description
        </label>
        <input
          name="description"
          type="text"
          required
          defaultValue={expense?.description}
          placeholder="What did you spend on?"
          autoFocus
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Amount
        </label>
        <div className="flex gap-2">
          <div className="flex bg-white rounded-xl shadow-sm overflow-hidden">
            {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={clsx(
                  "px-3 py-3 text-sm font-medium transition-colors",
                  currency === c
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {CURRENCIES[c].symbol}
              </button>
            ))}
          </div>
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
          />
        </div>
        {sgdPreview !== null && (
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            ≈ {formatSGD(sgdPreview)}
          </p>
        )}
        <input type="hidden" name="currency" value={currency} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]).map(
            ([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                    category === key
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-white text-gray-500 shadow-sm hover:shadow"
                  )}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            }
          )}
        </div>
        <input type="hidden" name="category" value={category} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Status
        </label>
        <div className="flex gap-2">
          {(["paid", "planned"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all",
                status === s
                  ? s === "paid"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-amber-500 text-white shadow-md"
                  : "bg-white text-gray-400 shadow-sm hover:shadow"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <input type="hidden" name="status" value={status} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Date
        </label>
        <input
          name="date"
          type="date"
          required
          defaultValue={expense?.date || todayISO()}
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={expense?.notes || ""}
          placeholder="Any extra details..."
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        {expense ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
}
