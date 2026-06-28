import { db } from "./index";
import { expenses, trips, users } from "./schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import type { Expense, Trip } from "./schema";

export async function getAllExpenses(
  userId: string,
  status?: "paid" | "planned",
  tripId?: string | null
): Promise<Expense[]> {
  const conditions = [eq(expenses.userId, userId)];
  if (status) conditions.push(eq(expenses.status, status));
  if (tripId !== undefined) {
    conditions.push(tripId === null ? isNull(expenses.tripId) : eq(expenses.tripId, tripId));
  }
  return db
    .select()
    .from(expenses)
    .where(and(...conditions))
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

export async function getSummary(userId: string, tripId?: string) {
  const conditions = [eq(expenses.userId, userId)];
  if (tripId) conditions.push(eq(expenses.tripId, tripId));

  const rows = await db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amountInr} else 0 end), 0)`,
      totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amountInr} else 0 end), 0)`,
    })
    .from(expenses)
    .where(and(...conditions));

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

export async function getAllTrips(userId: string) {
  const rows = await db
    .select({
      trip: trips,
      expenseCount: sql<number>`count(${expenses.id})`,
      totalAmount: sql<number>`coalesce(sum(${expenses.amountInr}), 0)`,
    })
    .from(trips)
    .leftJoin(expenses, eq(trips.id, expenses.tripId))
    .where(eq(trips.userId, userId))
    .groupBy(trips.id)
    .orderBy(desc(trips.updatedAt));

  return rows.map((r) => ({
    ...r.trip,
    expenseCount: r.expenseCount,
    totalAmount: r.totalAmount,
  }));
}

export async function getTripById(
  id: string,
  userId: string
): Promise<Trip | undefined> {
  const rows = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));
  return rows[0];
}
