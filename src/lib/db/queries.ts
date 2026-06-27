import { db } from "./index";
import { expenses, users } from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { Expense } from "./schema";

export async function getAllExpenses(
  userId: string,
  status?: "paid" | "planned"
): Promise<Expense[]> {
  if (status) {
    return db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, status)))
      .orderBy(desc(expenses.date));
  }
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date));
}

export async function getExpenseById(
  id: string,
  userId: string
): Promise<Expense | undefined> {
  const rows = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  return rows[0];
}

export async function getSummary(userId: string) {
  const rows = await db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amountInr} else 0 end), 0)`,
      totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amountInr} else 0 end), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId));

  const result = rows[0];
  return {
    totalPaid: result?.totalPaid ?? 0,
    totalPlanned: result?.totalPlanned ?? 0,
    total: (result?.totalPaid ?? 0) + (result?.totalPlanned ?? 0),
  };
}

export async function getUserByUsername(username: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  return rows[0];
}
