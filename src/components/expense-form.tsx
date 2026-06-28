"use client";

import { useActionState, useState, useEffect } from "react";
import { CURRENCIES, ICON_MAP, ICON_OPTIONS, COLOR_OPTIONS } from "@/lib/constants";
import {
  todayISO,
  convertToINR,
  formatINR,
  getMaxDate,
  getMinDate,
} from "@/lib/utils";
import {
  validateDescription,
  validateAmount,
  validateNotes,
  validateCategoryName,
} from "@/lib/validations";
import type { Expense, CategoryRecord } from "@/lib/db/schema";
import type { Currency, Status } from "@/lib/constants";
import type { ActionResult } from "@/lib/action-helpers";
import { addCategory } from "@/lib/actions";
import { Ellipsis, Plus, X } from "lucide-react";
import clsx from "clsx";

interface ExpenseFormProps {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>;
  expense?: Expense;
  categories: CategoryRecord[];
}

export function ExpenseForm({ action, expense, categories }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;
  const [category, setCategory] = useState<string>(
    expense?.category || categories[0]?.id || ""
  );
  const [status, setStatus] = useState<Status>(
    (expense?.status as Status) || "planned"
  );
  const [currency, setCurrency] = useState<Currency>(
    (expense?.currency as Currency) || "INR"
  );
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [localCategories, setLocalCategories] =
    useState<CategoryRecord[]>(categories);
  const [dateValue, setDateValue] = useState(expense?.date || todayISO());

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    const min = getMinDate(status);
    const max = getMaxDate(status);
    if (min && dateValue < min) setDateValue(min);
    if (max && dateValue > max) setDateValue(max);
  }, [status]);

  const inrPreview =
    currency !== "INR" && amount
      ? convertToINR(parseFloat(amount) || 0, currency)
      : null;

  function validateField(name: string, value: string) {
    let err: string | null = null;
    if (name === "description") err = validateDescription(value);
    if (name === "amount") err = validateAmount(value);
    if (name === "notes") err = validateNotes(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });
  }

  return (
    <>
      <form action={formAction} className="space-y-6">
        {state && !state.success && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Description
          </label>
          <input
            name="description"
            type="text"
            required
            maxLength={100}
            defaultValue={expense?.description}
            placeholder="What did you spend on?"
            autoFocus
            onBlur={(e) => validateField("description", e.target.value)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
          />
          {(errors.description || fieldErrors?.description) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.description || fieldErrors?.description}
            </p>
          )}
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
              onBlur={(e) => validateField("amount", e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
            />
          </div>
          {inrPreview !== null && (
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              ≈ {formatINR(inrPreview)}
            </p>
          )}
          {(errors.amount || fieldErrors?.amount) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.amount || fieldErrors?.amount}
            </p>
          )}
          <input type="hidden" name="currency" value={currency} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {localCategories.map((cat) => {
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
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-white text-gray-400 shadow-sm hover:shadow hover:text-gray-600 transition-all border-2 border-dashed border-gray-200"
            >
              <Plus size={14} />
              New
            </button>
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
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            min={getMinDate(status) || undefined}
            max={getMaxDate(status)}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200"
          />
          {fieldErrors?.date && (
            <p className="text-xs text-red-500 mt-1">
              {fieldErrors.date}
            </p>
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
            defaultValue={expense?.notes || ""}
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
          {isPending
            ? "Saving..."
            : expense
              ? "Update Expense"
              : "Add Expense"}
        </button>
      </form>

      {showCategoryModal && (
        <InlineCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCreated={(cat) => {
            setLocalCategories((prev) => [...prev, cat]);
            setCategory(cat.id);
            setShowCategoryModal(false);
          }}
        />
      )}
    </>
  );
}

function InlineCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (cat: CategoryRecord) => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0].key);
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0].classes);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const nameErr = validateCategoryName(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("icon", icon);
    formData.set("color", color);

    const result = await addCategory(null, formData);
    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onCreated({
      id: result.data!.categoryId,
      userId: "",
      name: name.trim(),
      icon,
      color,
      createdAt: "",
      updatedAt: "",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-gray-50 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">New Category</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="Category name"
            autoFocus
            className="w-full bg-white rounded-xl px-4 py-3 text-sm shadow-sm border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                    "flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all",
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
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Color
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setColor(opt.classes)}
                className={clsx(
                  "px-3 py-2 rounded-xl text-xs font-medium transition-all",
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
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Category"}
        </button>
      </div>
    </div>
  );
}
