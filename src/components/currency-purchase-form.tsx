"use client";

import { useActionState, useState, useEffect } from "react";
import { CURRENCIES, CURRENCY_SOURCE_STYLES } from "@/lib/constants";
import { todayISO } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-helpers";
import type { CurrencyPurchase } from "@/lib/db/schema";
import clsx from "clsx";

const ALL_CURRENCY_OPTIONS = [
  { code: "INR", name: "Indian Rupee" },
  ...CURRENCIES.map((c) => ({ code: c.code, name: c.name })),
];

interface CurrencyPurchaseFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  purchase?: CurrencyPurchase;
  defaultFromCurrency?: string;
  defaultToCurrency?: string;
}

export function CurrencyPurchaseForm({
  action,
  purchase,
  defaultFromCurrency = "INR",
  defaultToCurrency = "",
}: CurrencyPurchaseFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  const [type, setType] = useState<"buy" | "sell">(
    (purchase?.type as "buy" | "sell") || "buy"
  );
  const [source, setSource] = useState<"notes" | "card">(
    (purchase?.source as "notes" | "card") || "notes"
  );
  const [fromCurrency, setFromCurrency] = useState(
    purchase?.fromCurrency || defaultFromCurrency
  );
  const [toCurrency, setToCurrency] = useState(
    purchase?.toCurrency || defaultToCurrency
  );
  const [fromAmount, setFromAmount] = useState(
    purchase?.fromAmount?.toString() || ""
  );
  const [toAmount, setToAmount] = useState(
    purchase?.toAmount?.toString() || ""
  );
  const [rate, setRate] = useState(purchase?.rate?.toString() || "");
  const [lastEdited, setLastEdited] = useState<
    "fromAmount" | "toAmount" | "rate" | null
  >(null);

  useEffect(() => {
    const from = parseFloat(fromAmount);
    const to = parseFloat(toAmount);
    const r = parseFloat(rate);

    if (lastEdited === "fromAmount" && !isNaN(from) && !isNaN(r) && r > 0) {
      setToAmount((from / r).toFixed(4).replace(/\.?0+$/, ""));
    } else if (
      lastEdited === "toAmount" &&
      !isNaN(to) &&
      !isNaN(r) &&
      r > 0
    ) {
      setFromAmount((to * r).toFixed(4).replace(/\.?0+$/, ""));
    } else if (
      lastEdited === "rate" &&
      !isNaN(from) &&
      from > 0 &&
      !isNaN(r) &&
      r > 0
    ) {
      setToAmount((from / r).toFixed(4).replace(/\.?0+$/, ""));
    }
  }, [fromAmount, toAmount, rate, lastEdited]);

  function handleFromAmountChange(val: string) {
    setFromAmount(val);
    setLastEdited("fromAmount");
    const from = parseFloat(val);
    const to = parseFloat(toAmount);
    if (!isNaN(from) && !isNaN(to) && to > 0) {
      setRate((from / to).toFixed(6).replace(/\.?0+$/, ""));
    }
  }

  function handleToAmountChange(val: string) {
    setToAmount(val);
    setLastEdited("toAmount");
    const from = parseFloat(fromAmount);
    const to = parseFloat(val);
    if (!isNaN(from) && !isNaN(to) && to > 0) {
      setRate((from / to).toFixed(6).replace(/\.?0+$/, ""));
    }
  }

  function handleRateChange(val: string) {
    setRate(val);
    setLastEdited("rate");
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
          Type
        </label>
        <div className="flex gap-2">
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all",
                type === t
                  ? t === "buy"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-amber-500 text-white shadow-md"
                  : "bg-white text-gray-400 shadow-sm hover:shadow"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Source
        </label>
        <div className="flex gap-2">
          {(["notes", "card"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all",
                source === s
                  ? CURRENCY_SOURCE_STYLES[s] + " shadow-md ring-2 ring-offset-1 ring-gray-900"
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            From Currency
          </label>
          <select
            name="fromCurrency"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          >
            {ALL_CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          {fieldErrors?.fromCurrency && (
            <p className="text-xs text-red-500 mt-1">
              {fieldErrors.fromCurrency}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            To Currency
          </label>
          <select
            name="toCurrency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          >
            {ALL_CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          {fieldErrors?.toCurrency && (
            <p className="text-xs text-red-500 mt-1">
              {fieldErrors.toCurrency}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            {fromCurrency} Amount
          </label>
          <input
            name="fromAmount"
            type="text"
            inputMode="decimal"
            required
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
          />
          {fieldErrors?.fromAmount && (
            <p className="text-xs text-red-500 mt-1">
              {fieldErrors.fromAmount}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            {toCurrency || "To"} Amount
          </label>
          <input
            name="toAmount"
            type="text"
            inputMode="decimal"
            required
            value={toAmount}
            onChange={(e) => handleToAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
          />
          {fieldErrors?.toAmount && (
            <p className="text-xs text-red-500 mt-1">
              {fieldErrors.toAmount}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Rate (1 {toCurrency || "?"} = {fromCurrency})
        </label>
        <input
          name="rate"
          type="text"
          inputMode="decimal"
          required
          value={rate}
          onChange={(e) => handleRateChange(e.target.value)}
          placeholder="0.00"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
        />
        {fieldErrors?.rate && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.rate}</p>
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
          defaultValue={purchase?.date || todayISO()}
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
          defaultValue={purchase?.notes || ""}
          placeholder="Any extra details..."
          className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : purchase
            ? "Update Exchange"
            : "Record Exchange"}
      </button>
    </form>
  );
}
