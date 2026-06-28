"use server";

import { db } from "./db/index";
import { expenses, users } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "./auth";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { convertToINR } from "./utils";
import type { Currency } from "./constants";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function addExpense(formData: FormData) {
  const userId = await getUserId();
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as Currency) || "INR";
  const amountInr = convertToINR(amount, currency);

  await db.insert(expenses).values({
    id: crypto.randomUUID(),
    userId,
    description: formData.get("description") as string,
    amount,
    currency,
    amountInr,
    category: formData.get("category") as string,
    status: formData.get("status") as string,
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || null,
    paidBy: (formData.get("paidBy") as string) || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateExpense(id: string, formData: FormData) {
  const userId = await getUserId();
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as Currency) || "INR";
  const amountInr = convertToINR(amount, currency);

  await db
    .update(expenses)
    .set({
      description: formData.get("description") as string,
      amount,
      currency,
      amountInr,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      date: formData.get("date") as string,
      notes: (formData.get("notes") as string) || null,
      paidBy: (formData.get("paidBy") as string) || null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath("/");
  redirect("/");
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath("/");
  redirect("/");
}

export async function importExpenses(items: {
    description: string;
    amount: number;
    currency: string;
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
    const currency = item.currency as Currency;
    const amountInr = convertToINR(item.amount, currency);

    await db.insert(expenses).values({
      id: crypto.randomUUID(),
      userId,
      description: item.description,
      amount: item.amount,
      currency: item.currency,
      amountInr,
      category: item.category,
      status: item.status,
      date: item.date,
      notes: item.notes,
      paidBy: item.paidBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/");
  return {};
}

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
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
  const username = (formData.get("username") as string).trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }
  if (password.length < 4) {
    return { error: "Password must be at least 4 characters" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existing.length > 0) {
    return { error: "Username already taken" };
  }

  const hashed = await hash(password, 10);

  await db.insert(users).values({
    id: crypto.randomUUID(),
    username,
    password: hashed,
    createdAt: new Date().toISOString(),
  });

  redirect("/login?registered=1");
}
