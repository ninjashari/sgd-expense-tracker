import { db } from "./index";
import { expenses, users } from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { Expense } from "./schema";

export function getAllExpenses(
  userId: string,
  status?: "paid" | "planned"
): Expense[] {
  if (status) {
    return db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, status)))
      .orderBy(desc(expenses.date))
      .all();
  }
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date))
    .all();
}

export function getExpenseById(
  id: string,
  userId: string
): Expense | undefined {
  return db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .get();
}

export function getSummary(userId: string) {
  const result = db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amountSgd} else 0 end), 0)`,
      totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amountSgd} else 0 end), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .get();

  return {
    totalPaid: result?.totalPaid ?? 0,
    totalPlanned: result?.totalPlanned ?? 0,
    total: (result?.totalPaid ?? 0) + (result?.totalPlanned ?? 0),
  };
}

export function getUserByUsername(username: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();
}
