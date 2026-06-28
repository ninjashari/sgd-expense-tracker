"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ClipboardPaste, FileUp, Trash2 } from "lucide-react";
import { importExpenses } from "@/lib/actions";
import { CATEGORIES, CURRENCIES, type Category, type Currency, type Status } from "@/lib/constants";

interface ParsedRow {
  selected: boolean;
  description: string;
  amount: string;
  currency: Currency;
  category: Category;
  status: Status;
  date: string;
  notes: string;
  paidBy: string;
}

const EXPECTED_HEADERS = ["description", "amount", "currency", "category", "status", "date", "notes", "paidby"];
const VALID_CATEGORIES = Object.keys(CATEGORIES);
const VALID_CURRENCIES = Object.keys(CURRENCIES);

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], errors: ["Need a header row and at least one data row"] };

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const missingHeaders = EXPECTED_HEADERS.filter((h) => h !== "notes" && h !== "paidby" && !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { rows: [], errors: [`Missing columns: ${missingHeaders.join(", ")}`] };
  }

  const idx = Object.fromEntries(EXPECTED_HEADERS.map((h) => [h, headers.indexOf(h)]));
  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 6) {
      errors.push(`Row ${i}: not enough columns`);
      continue;
    }

    const amount = parseFloat(fields[idx.amount]);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i}: invalid amount "${fields[idx.amount]}"`);
      continue;
    }

    const currency = fields[idx.currency]?.toUpperCase() as Currency;
    if (!VALID_CURRENCIES.includes(currency)) {
      errors.push(`Row ${i}: invalid currency "${fields[idx.currency]}"`);
      continue;
    }

    const category = fields[idx.category]?.toLowerCase() as Category;
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`Row ${i}: invalid category "${fields[idx.category]}"`);
      continue;
    }

    const status = fields[idx.status]?.toLowerCase() as Status;
    if (status !== "paid" && status !== "planned") {
      errors.push(`Row ${i}: invalid status "${fields[idx.status]}"`);
      continue;
    }

    const date = fields[idx.date];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Row ${i}: invalid date "${date}", expected YYYY-MM-DD`);
      continue;
    }

    rows.push({
      selected: true,
      description: fields[idx.description] || "",
      amount: amount.toString(),
      currency,
      category,
      status,
      date,
      notes: idx.notes >= 0 ? fields[idx.notes] || "" : "",
      paidBy: idx.paidby >= 0 ? fields[idx.paidby] || "" : "",
    });
  }

  return { rows, errors };
}

export function ImportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleParse() {
    const { rows: parsed, errors: errs } = parseCsv(text);
    setRows(parsed);
    setErrors(errs);
    setImportError("");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      const { rows: parsed, errors: errs } = parseCsv(content);
      setRows(parsed);
      setErrors(errs);
      setImportError("");
    };
    reader.readAsText(file);
  }

  function toggleRow(i: number) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, selected: !r.selected } : r)));
  }

  function updateRow(i: number, field: keyof ParsedRow, value: string) {
    setRows((prev) =>
      prev.map((r, j) => (j === i ? { ...r, [field]: value } : r))
    );
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  async function handleImport() {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;

    setImporting(true);
    setImportError("");

    const expenses = selected.map((r) => ({
      description: r.description,
      amount: parseFloat(r.amount),
      currency: r.currency,
      category: r.category,
      status: r.status,
      date: r.date,
      notes: r.notes || null,
      paidBy: r.paidBy || null,
    }));

    const result = await importExpenses(expenses);
    setImporting(false);

    if (result && "error" in result && result.error) {
      setImportError(result.error as string);
    } else {
      setText("");
      setRows([]);
      setErrors([]);
      onClose();
    }
  }

  function handleClose() {
    setText("");
    setRows([]);
    setErrors([]);
    setImportError("");
    onClose();
  }

  if (!open) return null;

  const selectedCount = rows.filter((r) => r.selected).length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold">Import Expenses</h2>
          <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {rows.length === 0 && (
            <>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setMode("paste")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md transition-colors ${mode === "paste" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                >
                  <ClipboardPaste size={14} />
                  Paste
                </button>
                <button
                  onClick={() => setMode("file")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md transition-colors ${mode === "file" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                >
                  <FileUp size={14} />
                  Upload CSV
                </button>
              </div>

              {mode === "paste" ? (
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`description,amount,currency,category,status,date,notes,paidby\nBreakfast,250,INR,food,paid,2025-01-15,Hotel buffet,John`}
                  rows={8}
                  className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-mono border-0 outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-300 resize-none"
                />
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload CSV</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFile}
                    className="hidden"
                  />
                </div>
              )}

              {mode === "paste" && text.trim() && (
                <button
                  onClick={handleParse}
                  className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Parse
                </button>
              )}
            </>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl space-y-0.5">
              {errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {selectedCount} of {rows.length} selected
                </p>
                <button
                  onClick={() => {
                    setRows([]);
                    setErrors([]);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 space-y-2 transition-opacity ${row.selected ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleRow(i)}
                        className="rounded accent-gray-900"
                      />
                      <input
                        value={row.description}
                        onChange={(e) => updateRow(i, "description", e.target.value)}
                        className="flex-1 text-sm font-medium bg-transparent outline-none"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => updateRow(i, "amount", e.target.value)}
                        className="min-w-0 text-xs bg-gray-50 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-gray-200"
                        placeholder="Amount"
                      />
                      <select
                        value={row.currency}
                        onChange={(e) => updateRow(i, "currency", e.target.value)}
                        className="min-w-0 text-xs bg-gray-50 rounded-lg px-2 py-1.5 outline-none"
                      >
                        {Object.keys(CURRENCIES).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        value={row.category}
                        onChange={(e) => updateRow(i, "category", e.target.value)}
                        className="min-w-0 text-xs bg-gray-50 rounded-lg px-2 py-1.5 outline-none"
                      >
                        {Object.entries(CATEGORIES).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <select
                        value={row.status}
                        onChange={(e) => updateRow(i, "status", e.target.value)}
                        className="min-w-0 text-xs bg-gray-50 rounded-lg px-2 py-1.5 outline-none"
                      >
                        <option value="planned">Planned</option>
                        <option value="paid">Paid</option>
                      </select>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(i, "date", e.target.value)}
                        className="min-w-0 text-xs bg-gray-50 rounded-lg px-2 py-1.5 outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={row.paidBy}
                        onChange={(e) => updateRow(i, "paidBy", e.target.value)}
                        className="w-1/3 text-xs text-gray-500 bg-transparent outline-none"
                        placeholder="Paid by (optional)"
                      />
                      <input
                        value={row.notes}
                        onChange={(e) => updateRow(i, "notes", e.target.value)}
                        className="flex-1 text-xs text-gray-500 bg-transparent outline-none"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importError && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl">
              {importError}
            </div>
          )}
        </div>

        {rows.length > 0 && selectedCount > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${selectedCount} expense${selectedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
