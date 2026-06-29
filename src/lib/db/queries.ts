import { db } from "./index";
import { expenses, users, categories, trips } from "./schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import type { Expense, CategoryRecord, Trip } from "./schema";

export async function getAllExpenses(
  userId: string,
  tripId: string,
  status?: "paid" | "planned"
): Promise<Expense[]> {
  const conditions = [eq(expenses.userId, userId), eq(expenses.tripId, tripId)];
  if (status) {
    conditions.push(eq(expenses.status, status));
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

export async function getSummary(userId: string) {
  const rows = await db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amount} else 0 end), 0)`,
      totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amount} else 0 end), 0)`,
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

export async function getTripSummary(tripId: string, userId: string) {
  const rows = await db
    .select({
      totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amount} else 0 end), 0)`,
      totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amount} else 0 end), 0)`,
    })
    .from(expenses)
    .where(and(eq(expenses.tripId, tripId), eq(expenses.userId, userId)));

  const result = rows[0];
  return {
    totalPaid: result?.totalPaid ?? 0,
    totalPlanned: result?.totalPlanned ?? 0,
    total: (result?.totalPaid ?? 0) + (result?.totalPlanned ?? 0),
  };
}

export type CategoryBreakdownItem = {
  categoryId: string;
  total: number;
};

export async function getAllTripsTotals(
  userId: string
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      tripId: expenses.tripId,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.tripId);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.tripId] = row.total;
  }
  return result;
}

export async function getAllTripsCategoryBreakdown(
  userId: string
): Promise<Record<string, CategoryBreakdownItem[]>> {
  const rows = await db
    .select({
      tripId: expenses.tripId,
      categoryId: expenses.category,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.tripId, expenses.category);

  const result: Record<string, CategoryBreakdownItem[]> = {};
  for (const row of rows) {
    if (!result[row.tripId]) {
      result[row.tripId] = [];
    }
    result[row.tripId].push({
      categoryId: row.categoryId,
      total: row.total,
    });
  }
  return result;
}

export async function getUserByUsername(username: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  return rows[0];
}

export async function getCategoriesForUser(
  userId: string
): Promise<CategoryRecord[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

export async function getCategoryById(
  id: string,
  userId: string
): Promise<CategoryRecord | undefined> {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  return rows[0];
}

export async function getCategoryExpenseCount(
  categoryId: string
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(expenses)
    .where(eq(expenses.category, categoryId));
  return rows[0]?.value ?? 0;
}

export async function getTripsForUser(userId: string): Promise<Trip[]> {
  return db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.startDate));
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
