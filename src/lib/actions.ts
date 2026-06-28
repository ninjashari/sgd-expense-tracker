"use server";

import { db } from "./db/index";
import { expenses, users, categories, trips } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "./auth";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { convertToINR } from "./utils";
import type { Currency } from "./constants";
import { DEFAULT_CATEGORIES, ICON_MAP, COLOR_OPTIONS } from "./constants";
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
} from "./validations";
import { getCategoriesForUser, getCategoryExpenseCount } from "./db/queries";

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
  const currency = (formData.get("currency") as Currency) || "INR";
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
  const amountInr = convertToINR(amount, currency);

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
  const currency = (formData.get("currency") as Currency) || "INR";
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
  const amountInr = convertToINR(amount, currency);

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

  const tripId = crypto.randomUUID();
  await db.insert(trips).values({
    id: tripId,
    userId,
    name: name.trim(),
    destination: destination.trim(),
    startDate,
    endDate,
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

  await db
    .update(trips)
    .set({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));

  revalidatePath("/");
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}/settings`);
}

export async function deleteTrip(id: string) {
  const userId = await getUserId();

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
