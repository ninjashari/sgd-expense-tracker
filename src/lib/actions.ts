"use server";

import { db } from "./db/index";
import {
  expenses,
  users,
  categories,
  trips,
  currencyPurchases,
  ezlinkTransactions,
} from "./db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "./auth";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import {
  DEFAULT_CATEGORIES,
  ICON_MAP,
  COLOR_OPTIONS,
  CURRENCY_CODES,
} from "./constants";
import type { ActionResult } from "./action-helpers";
import {
  validateDescription,
  validateAmount,
  validateCategory,
  validateStatus,
  validateExpenseDate,
  validateNotes,
  validateTripName,
  validateDestination,
  validateTripDates,
  validateCategoryName,
  validateUsername,
  validatePassword,
  validateExchangeRate,
  validateCurrencySource,
  validatePurchaseType,
  validateCurrencyCode,
  validateEzLinkType,
} from "./validations";
import {
  getCategoriesForUser,
  getCategoryExpenseCount,
  getForexBalancesAndRates,
  getEzLinkBalance,
  getEzLinkTransactionById,
} from "./db/queries";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// ── Expense Actions ──

export async function addExpense(
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const description = (formData.get("description") as string) || "";
  const amountStr = (formData.get("amount") as string) || "";
  const categoryId = (formData.get("category") as string) || "";
  const status = (formData.get("status") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const userCategories = await getCategoriesForUser(userId);
  const validCategoryIds = userCategories.map((c) => c.id);

  const fieldErrors: Record<string, string> = {};
  const descErr = validateDescription(description);
  if (descErr) fieldErrors.description = descErr;
  const amtErr = validateAmount(amountStr);
  if (amtErr) fieldErrors.amount = amtErr;
  const catErr = validateCategory(categoryId, validCategoryIds);
  if (catErr) fieldErrors.category = catErr;
  const statusErr = validateStatus(status);
  if (statusErr) fieldErrors.status = statusErr;
  const dateErr = validateExpenseDate(date, status);
  if (dateErr) fieldErrors.date = dateErr;
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const amount = parseFloat(amountStr);
  const currency = (formData.get("currency") as string) || "INR";
  const currencySource =
    (formData.get("currencySource") as string) || null;
  const amountInrStr = formData.get("amountInr") as string;
  const amountInr =
    currency === "INR"
      ? amount
      : amountInrStr
        ? parseFloat(amountInrStr)
        : amount;

  await db.insert(expenses).values({
    id: crypto.randomUUID(),
    userId,
    tripId,
    description: description.trim(),
    amount,
    currency,
    amountInr,
    category: categoryId,
    status,
    date,
    notes: notes.trim() || null,
    paidBy: ((formData.get("paidBy") as string) || "").trim() || null,
    currencySource: currency !== "INR" ? currencySource : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function updateExpense(
  id: string,
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const description = (formData.get("description") as string) || "";
  const amountStr = (formData.get("amount") as string) || "";
  const categoryId = (formData.get("category") as string) || "";
  const status = (formData.get("status") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const userCategories = await getCategoriesForUser(userId);
  const validCategoryIds = userCategories.map((c) => c.id);

  const fieldErrors: Record<string, string> = {};
  const descErr = validateDescription(description);
  if (descErr) fieldErrors.description = descErr;
  const amtErr = validateAmount(amountStr);
  if (amtErr) fieldErrors.amount = amtErr;
  const catErr = validateCategory(categoryId, validCategoryIds);
  if (catErr) fieldErrors.category = catErr;
  const statusErr = validateStatus(status);
  if (statusErr) fieldErrors.status = statusErr;
  const dateErr = validateExpenseDate(date, status);
  if (dateErr) fieldErrors.date = dateErr;
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const amount = parseFloat(amountStr);
  const currency = (formData.get("currency") as string) || "INR";
  const currencySource =
    (formData.get("currencySource") as string) || null;
  const amountInrStr = formData.get("amountInr") as string;
  const amountInr =
    currency === "INR"
      ? amount
      : amountInrStr
        ? parseFloat(amountInrStr)
        : amount;

  await db
    .update(expenses)
    .set({
      description: description.trim(),
      amount,
      currency,
      amountInr,
      category: categoryId,
      status,
      date,
      notes: notes.trim() || null,
      paidBy: ((formData.get("paidBy") as string) || "").trim() || null,
      currencySource: currency !== "INR" ? currencySource : null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();

  const expense = await db
    .select({ tripId: expenses.tripId })
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  const tripId = expense[0]?.tripId;

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

// ── Trip Actions ──

export async function addTrip(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const name = (formData.get("name") as string) || "";
  const destination = (formData.get("destination") as string) || "";
  const startDate = (formData.get("startDate") as string) || "";
  const endDate = (formData.get("endDate") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const nameErr = validateTripName(name);
  if (nameErr) fieldErrors.name = nameErr;
  const destErr = validateDestination(destination);
  if (destErr) fieldErrors.destination = destErr;
  const dateErr = validateTripDates(startDate, endDate);
  if (dateErr) fieldErrors.dates = dateErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const foreignCurrency =
    ((formData.get("foreignCurrency") as string) || "").trim() || null;
  if (foreignCurrency && !CURRENCY_CODES.includes(foreignCurrency)) {
    return { success: false, error: "Invalid foreign currency" };
  }

  const tripId = crypto.randomUUID();
  await db.insert(trips).values({
    id: tripId,
    userId,
    name: name.trim(),
    destination: destination.trim(),
    startDate,
    endDate,
    foreignCurrency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/");
  redirect(`/trips/${tripId}`);
}

export async function updateTrip(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const name = (formData.get("name") as string) || "";
  const destination = (formData.get("destination") as string) || "";
  const startDate = (formData.get("startDate") as string) || "";
  const endDate = (formData.get("endDate") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const nameErr = validateTripName(name);
  if (nameErr) fieldErrors.name = nameErr;
  const destErr = validateDestination(destination);
  if (destErr) fieldErrors.destination = destErr;
  const dateErr = validateTripDates(startDate, endDate);
  if (dateErr) fieldErrors.dates = dateErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const foreignCurrency =
    ((formData.get("foreignCurrency") as string) || "").trim() || null;
  if (foreignCurrency && !CURRENCY_CODES.includes(foreignCurrency)) {
    return { success: false, error: "Invalid foreign currency" };
  }

  await db
    .update(trips)
    .set({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      foreignCurrency,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));

  revalidatePath("/");
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
}

export async function deleteTrip(id: string) {
  const userId = await getUserId();

  await db
    .delete(currencyPurchases)
    .where(
      and(eq(currencyPurchases.tripId, id), eq(currencyPurchases.userId, userId))
    );

  await db
    .delete(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.tripId, id),
        eq(ezlinkTransactions.userId, userId)
      )
    );

  await db
    .delete(expenses)
    .where(and(eq(expenses.tripId, id), eq(expenses.userId, userId)));

  await db
    .delete(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));

  revalidatePath("/");
  redirect("/");
}

// ── Category Actions ──

export async function addCategory(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const name = (formData.get("name") as string) || "";
  const icon = (formData.get("icon") as string) || "";
  const color = (formData.get("color") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const nameErr = validateCategoryName(name);
  if (nameErr) fieldErrors.name = nameErr;
  if (!icon || !ICON_MAP[icon]) fieldErrors.icon = "Please select an icon";
  if (!color || !COLOR_OPTIONS.some((c) => c.classes === color))
    fieldErrors.color = "Please select a color";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const categoryId = crypto.randomUUID();
  await db.insert(categories).values({
    id: categoryId,
    userId,
    name: name.trim(),
    icon,
    color,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/categories");
  return { success: true, data: { categoryId } };
}

export async function updateCategory(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const name = (formData.get("name") as string) || "";
  const icon = (formData.get("icon") as string) || "";
  const color = (formData.get("color") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const nameErr = validateCategoryName(name);
  if (nameErr) fieldErrors.name = nameErr;
  if (!icon || !ICON_MAP[icon]) fieldErrors.icon = "Please select an icon";
  if (!color || !COLOR_OPTIONS.some((c) => c.classes === color))
    fieldErrors.color = "Please select a color";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  await db
    .update(categories)
    .set({
      name: name.trim(),
      icon,
      color,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));

  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await getUserId();

  const expenseCount = await getCategoryExpenseCount(id);
  if (expenseCount > 0) {
    return {
      success: false,
      error: `Cannot delete: ${expenseCount} expense(s) use this category`,
    };
  }

  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));

  revalidatePath("/categories");
  redirect("/categories");
}

// ── Import Action ──

export async function importExpenses(
  tripId: string,
  items: {
    description: string;
    amount: number;
    category: string;
    status: string;
    date: string;
    notes: string | null;
    paidBy: string | null;
  }[]
) {
  const userId = await getUserId();
  const now = new Date().toISOString();

  for (const item of items) {
    await db.insert(expenses).values({
      id: crypto.randomUUID(),
      userId,
      tripId,
      description: item.description,
      amount: item.amount,
      currency: "INR",
      amountInr: item.amount,
      category: item.category,
      status: item.status,
      date: item.date,
      notes: item.notes,
      paidBy: item.paidBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath(`/trips/${tripId}`);
  return {};
}

// ── Currency Purchase Actions ──

export async function addCurrencyPurchase(
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const type = (formData.get("type") as string) || "";
  const source = (formData.get("source") as string) || "";
  const fromCurrency = (formData.get("fromCurrency") as string) || "";
  const toCurrency = (formData.get("toCurrency") as string) || "";
  const fromAmountStr = (formData.get("fromAmount") as string) || "";
  const toAmountStr = (formData.get("toAmount") as string) || "";
  const rateStr = (formData.get("rate") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const typeErr = validatePurchaseType(type);
  if (typeErr) fieldErrors.type = typeErr;
  const sourceErr = validateCurrencySource(source);
  if (sourceErr) fieldErrors.source = sourceErr;
  const allCodes = ["INR", ...CURRENCY_CODES];
  const fromErr = validateCurrencyCode(fromCurrency, allCodes);
  if (fromErr) fieldErrors.fromCurrency = fromErr;
  const toErr = validateCurrencyCode(toCurrency, allCodes);
  if (toErr) fieldErrors.toCurrency = toErr;
  if (fromCurrency === toCurrency && fromCurrency)
    fieldErrors.toCurrency = "Currencies must be different";
  const fromAmtErr = validateAmount(fromAmountStr);
  if (fromAmtErr) fieldErrors.fromAmount = fromAmtErr;
  const toAmtErr = validateAmount(toAmountStr);
  if (toAmtErr) fieldErrors.toAmount = toAmtErr;
  const rateErr = validateExchangeRate(rateStr);
  if (rateErr) fieldErrors.rate = rateErr;
  if (!date) fieldErrors.date = "Date is required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const fromAmount = parseFloat(fromAmountStr);
  const toAmount = parseFloat(toAmountStr);
  const rate = parseFloat(rateStr);

  if (type === "sell") {
    const balances = await getForexBalancesAndRates(tripId, userId);
    const srcBal = balances.find((b) => b.currency === fromCurrency);
    const available =
      source === "card"
        ? (srcBal?.cardBalance ?? 0)
        : (srcBal?.notesBalance ?? 0);
    if (fromAmount > available) {
      return {
        success: false,
        error: `Insufficient ${fromCurrency} ${source} balance (available: ${available.toFixed(2)})`,
      };
    }
  }

  await db.insert(currencyPurchases).values({
    id: crypto.randomUUID(),
    userId,
    tripId,
    type,
    source,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    rate,
    date,
    notes: notes.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=forex`);
}

export async function updateCurrencyPurchase(
  id: string,
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const type = (formData.get("type") as string) || "";
  const source = (formData.get("source") as string) || "";
  const fromCurrency = (formData.get("fromCurrency") as string) || "";
  const toCurrency = (formData.get("toCurrency") as string) || "";
  const fromAmountStr = (formData.get("fromAmount") as string) || "";
  const toAmountStr = (formData.get("toAmount") as string) || "";
  const rateStr = (formData.get("rate") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const typeErr = validatePurchaseType(type);
  if (typeErr) fieldErrors.type = typeErr;
  const sourceErr = validateCurrencySource(source);
  if (sourceErr) fieldErrors.source = sourceErr;
  const allCodes = ["INR", ...CURRENCY_CODES];
  const fromErr = validateCurrencyCode(fromCurrency, allCodes);
  if (fromErr) fieldErrors.fromCurrency = fromErr;
  const toErr = validateCurrencyCode(toCurrency, allCodes);
  if (toErr) fieldErrors.toCurrency = toErr;
  if (fromCurrency === toCurrency && fromCurrency)
    fieldErrors.toCurrency = "Currencies must be different";
  const fromAmtErr = validateAmount(fromAmountStr);
  if (fromAmtErr) fieldErrors.fromAmount = fromAmtErr;
  const toAmtErr = validateAmount(toAmountStr);
  if (toAmtErr) fieldErrors.toAmount = toAmtErr;
  const rateErr = validateExchangeRate(rateStr);
  if (rateErr) fieldErrors.rate = rateErr;
  if (!date) fieldErrors.date = "Date is required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  await db
    .update(currencyPurchases)
    .set({
      type,
      source,
      fromCurrency,
      toCurrency,
      fromAmount: parseFloat(fromAmountStr),
      toAmount: parseFloat(toAmountStr),
      rate: parseFloat(rateStr),
      date,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(currencyPurchases.id, id), eq(currencyPurchases.userId, userId))
    );

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=forex`);
}

export async function deleteCurrencyPurchase(id: string) {
  const userId = await getUserId();

  const rows = await db
    .select({ tripId: currencyPurchases.tripId })
    .from(currencyPurchases)
    .where(
      and(eq(currencyPurchases.id, id), eq(currencyPurchases.userId, userId))
    );

  const tripId = rows[0]?.tripId;

  await db
    .delete(currencyPurchases)
    .where(
      and(eq(currencyPurchases.id, id), eq(currencyPurchases.userId, userId))
    );

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=forex`);
}

// ── EZ-Link Actions ──

export async function addEzLinkTopup(
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const type = (formData.get("type") as string) || "";
  const amountSgdStr = (formData.get("amountSgd") as string) || "";
  const amountInrStr = (formData.get("amountInr") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const typeErr = validateEzLinkType(type);
  if (typeErr) fieldErrors.type = typeErr;
  const sgdErr = validateAmount(amountSgdStr);
  if (sgdErr) fieldErrors.amountSgd = sgdErr;
  const inrErr = validateAmount(amountInrStr);
  if (inrErr) fieldErrors.amountInr = inrErr;
  if (!date) fieldErrors.date = "Date is required";
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  await db.insert(ezlinkTransactions).values({
    id: crypto.randomUUID(),
    userId,
    tripId,
    type: "topup",
    amountSgd: parseFloat(amountSgdStr),
    amountInr: parseFloat(amountInrStr),
    category: null,
    date,
    notes: notes.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=ezlink`);
}

export async function addEzLinkSpend(
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const type = (formData.get("type") as string) || "";
  const amountSgdStr = (formData.get("amountSgd") as string) || "";
  const categoryId = (formData.get("category") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const userCategories = await getCategoriesForUser(userId);
  const validCategoryIds = userCategories.map((c) => c.id);

  const fieldErrors: Record<string, string> = {};
  const typeErr = validateEzLinkType(type);
  if (typeErr) fieldErrors.type = typeErr;
  const sgdErr = validateAmount(amountSgdStr);
  if (sgdErr) fieldErrors.amountSgd = sgdErr;
  const catErr = validateCategory(categoryId, validCategoryIds);
  if (catErr) fieldErrors.category = catErr;
  if (!date) fieldErrors.date = "Date is required";
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  const amountSgd = parseFloat(amountSgdStr);
  const balance = await getEzLinkBalance(tripId, userId);
  if (amountSgd > balance.balanceSgd) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: {
        amountSgd: `Insufficient EZ-Link balance (available: S$${balance.balanceSgd.toFixed(2)})`,
      },
    };
  }

  const amountInr = amountSgd * balance.cumulativeRate;

  await db.insert(ezlinkTransactions).values({
    id: crypto.randomUUID(),
    userId,
    tripId,
    type: "spend",
    amountSgd,
    amountInr,
    category: categoryId,
    date,
    notes: notes.trim() || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=ezlink`);
}

export async function updateEzLinkTransaction(
  id: string,
  tripId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = await getUserId();

  const existing = await getEzLinkTransactionById(id, userId);
  if (!existing) {
    return { success: false, error: "Transaction not found" };
  }

  const amountSgdStr = (formData.get("amountSgd") as string) || "";
  const date = (formData.get("date") as string) || "";
  const notes = (formData.get("notes") as string) || "";

  const fieldErrors: Record<string, string> = {};
  const sgdErr = validateAmount(amountSgdStr);
  if (sgdErr) fieldErrors.amountSgd = sgdErr;
  if (!date) fieldErrors.date = "Date is required";
  const notesErr = validateNotes(notes);
  if (notesErr) fieldErrors.notes = notesErr;

  const amountSgd = parseFloat(amountSgdStr);
  let amountInr = existing.amountInr;
  let categoryId: string | null = existing.category;

  if (existing.type === "topup") {
    const amountInrStr = (formData.get("amountInr") as string) || "";
    const inrErr = validateAmount(amountInrStr);
    if (inrErr) fieldErrors.amountInr = inrErr;
    amountInr = parseFloat(amountInrStr);
  } else {
    categoryId = (formData.get("category") as string) || "";
    const userCategories = await getCategoriesForUser(userId);
    const validCategoryIds = userCategories.map((c) => c.id);
    const catErr = validateCategory(categoryId, validCategoryIds);
    if (catErr) fieldErrors.category = catErr;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors,
    };
  }

  if (existing.type === "spend") {
    const balance = await getEzLinkBalance(tripId, userId);
    const available = balance.balanceSgd + existing.amountSgd;
    if (amountSgd > available) {
      return {
        success: false,
        error: "Please fix the errors below",
        fieldErrors: {
          amountSgd: `Insufficient EZ-Link balance (available: S$${available.toFixed(2)})`,
        },
      };
    }
    amountInr = amountSgd * (balance.cumulativeRate || 0);
  }

  await db
    .update(ezlinkTransactions)
    .set({
      amountSgd,
      amountInr,
      category: categoryId,
      date,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(eq(ezlinkTransactions.id, id), eq(ezlinkTransactions.userId, userId))
    );

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=ezlink`);
}

export async function deleteEzLinkTransaction(id: string) {
  const userId = await getUserId();

  const rows = await db
    .select({ tripId: ezlinkTransactions.tripId })
    .from(ezlinkTransactions)
    .where(
      and(eq(ezlinkTransactions.id, id), eq(ezlinkTransactions.userId, userId))
    );

  const tripId = rows[0]?.tripId;

  await db
    .delete(ezlinkTransactions)
    .where(
      and(eq(ezlinkTransactions.id, id), eq(ezlinkTransactions.userId, userId))
    );

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}?view=ezlink`);
}

// ── Auth Actions ──

export async function loginUser(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  const usernameErr = validateUsername(username);
  if (usernameErr) return { error: usernameErr };
  const passwordErr = validatePassword(password);
  if (passwordErr) return { error: passwordErr };

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid username or password" };
    }
    throw error;
  }
}

export async function registerUser(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  const usernameErr = validateUsername(username);
  if (usernameErr) return { error: usernameErr };
  const passwordErr = validatePassword(password);
  if (passwordErr) return { error: passwordErr };
  if (password !== confirm) return { error: "Passwords do not match" };

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existing.length > 0) {
    return { error: "Username already taken" };
  }

  const hashed = await hash(password, 10);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(users).values({
    id: userId,
    username,
    password: hashed,
    createdAt: now,
  });

  const categoryValues = DEFAULT_CATEGORIES.map((cat) => ({
    id: crypto.randomUUID(),
    userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(categories).values(categoryValues);

  redirect("/login?registered=1");
}
