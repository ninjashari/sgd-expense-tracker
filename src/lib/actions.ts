"use server";

import { db } from "./db/index";
import { expenses, users } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { hash } from "bcryptjs";
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

  db.insert(expenses)
    .values({
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .run();

  revalidatePath("/");
  redirect("/");
}

export async function updateExpense(id: string, formData: FormData) {
  const userId = await getUserId();
  const amount = parseFloat(formData.get("amount") as string);
  const currency = (formData.get("currency") as Currency) || "INR";
  const amountInr = convertToINR(amount, currency);

  db.update(expenses)
    .set({
      description: formData.get("description") as string,
      amount,
      currency,
      amountInr,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
      date: formData.get("date") as string,
      notes: (formData.get("notes") as string) || null,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .run();

  revalidatePath("/");
  redirect("/");
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();

  db.delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .run();

  revalidatePath("/");
  redirect("/");
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

  const existing = db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (existing) {
    return { error: "Username already taken" };
  }

  const hashed = await hash(password, 10);

  db.insert(users)
    .values({
      id: crypto.randomUUID(),
      username,
      password: hashed,
      createdAt: new Date().toISOString(),
    })
    .run();

  redirect("/login?registered=1");
}
