import { db } from "./index";
import {
  expenses,
  users,
  categories,
  trips,
  currencyPurchases,
  ezlinkTransactions,
} from "./schema";
import { eq, and, desc, sql, count, ne } from "drizzle-orm";
import type {
  Expense,
  CategoryRecord,
  Trip,
  CurrencyPurchase,
  EzLinkTransaction,
} from "./schema";

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
  const [rows, ezlinkSpend] = await Promise.all([
    db
      .select({
        totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amountInr} else 0 end), 0)`,
        totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amountInr} else 0 end), 0)`,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId)),
    getEzLinkSpendTotalForUser(userId),
  ]);

  const result = rows[0];
  const totalPaid = (result?.totalPaid ?? 0) + ezlinkSpend;
  const totalPlanned = result?.totalPlanned ?? 0;
  return {
    totalPaid,
    totalPlanned,
    total: totalPaid + totalPlanned,
  };
}

export async function getTripSummary(tripId: string, userId: string) {
  const [rows, ezlinkSpend] = await Promise.all([
    db
      .select({
        totalPaid: sql<number>`coalesce(sum(case when ${expenses.status} = 'paid' then ${expenses.amountInr} else 0 end), 0)`,
        totalPlanned: sql<number>`coalesce(sum(case when ${expenses.status} = 'planned' then ${expenses.amountInr} else 0 end), 0)`,
      })
      .from(expenses)
      .where(and(eq(expenses.tripId, tripId), eq(expenses.userId, userId))),
    getEzLinkSpendTotal(tripId, userId),
  ]);

  const result = rows[0];
  const totalPaid = (result?.totalPaid ?? 0) + ezlinkSpend;
  const totalPlanned = result?.totalPlanned ?? 0;
  return {
    totalPaid,
    totalPlanned,
    total: totalPaid + totalPlanned,
  };
}

export type CategoryBreakdownItem = {
  categoryId: string;
  total: number;
};

export async function getAllTripsTotals(
  userId: string
): Promise<Record<string, number>> {
  const [rows, ezlinkTotals] = await Promise.all([
    db
      .select({
        tripId: expenses.tripId,
        total: sql<number>`coalesce(sum(${expenses.amountInr}), 0)`,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .groupBy(expenses.tripId),
    getEzLinkSpendTotalsByTrip(userId),
  ]);

  const result: Record<string, number> = { ...ezlinkTotals };
  for (const row of rows) {
    result[row.tripId] = (result[row.tripId] ?? 0) + row.total;
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
      total: sql<number>`coalesce(sum(${expenses.amountInr}), 0)`,
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

// ── Forex Queries ──

export async function getCurrencyPurchasesForTrip(
  tripId: string,
  userId: string
): Promise<CurrencyPurchase[]> {
  return db
    .select()
    .from(currencyPurchases)
    .where(
      and(
        eq(currencyPurchases.tripId, tripId),
        eq(currencyPurchases.userId, userId)
      )
    )
    .orderBy(desc(currencyPurchases.date));
}

export async function getCurrencyPurchaseById(
  id: string,
  userId: string
): Promise<CurrencyPurchase | undefined> {
  const rows = await db
    .select()
    .from(currencyPurchases)
    .where(
      and(eq(currencyPurchases.id, id), eq(currencyPurchases.userId, userId))
    );
  return rows[0];
}

export type ForexCurrencyBalance = {
  currency: string;
  notesBalance: number;
  cardBalance: number;
  totalBalance: number;
  inrCost: number;
  cumulativeRate: number;
};

export type ForexTransaction = {
  id: string;
  date: string;
  createdAt: string;
  type: "buy" | "sell" | "expense";
  source: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  description: string;
};

export async function getForexBalancesAndRates(
  tripId: string,
  userId: string
): Promise<ForexCurrencyBalance[]> {
  const [purchases, expenseList] = await Promise.all([
    db
      .select()
      .from(currencyPurchases)
      .where(
        and(
          eq(currencyPurchases.tripId, tripId),
          eq(currencyPurchases.userId, userId)
        )
      )
      .orderBy(currencyPurchases.date, currencyPurchases.createdAt),
    db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.tripId, tripId),
          eq(expenses.userId, userId),
          ne(expenses.currency, "INR")
        )
      )
      .orderBy(expenses.date, expenses.createdAt),
  ]);

  const balances: Record<
    string,
    { notes: number; card: number; inrCost: number }
  > = {};

  function ensureCurrency(code: string) {
    if (!balances[code]) {
      balances[code] = { notes: 0, card: 0, inrCost: 0 };
    }
  }

  const allEvents: Array<
    | { kind: "purchase"; data: CurrencyPurchase }
    | { kind: "expense"; data: Expense }
  > = [
    ...purchases.map(
      (p) => ({ kind: "purchase" as const, data: p, _date: p.date, _ts: p.createdAt })
    ),
    ...expenseList.map(
      (e) => ({ kind: "expense" as const, data: e, _date: e.date, _ts: e.createdAt })
    ),
  ].sort((a, b) => {
    const d = a._date.localeCompare(b._date);
    if (d !== 0) return d;
    return a._ts.localeCompare(b._ts);
  });

  for (const event of allEvents) {
    if (event.kind === "purchase") {
      const p = event.data;
      const fromCode = p.fromCurrency;
      const toCode = p.toCurrency;
      ensureCurrency(fromCode);
      ensureCurrency(toCode);

      const srcField = p.source === "card" ? "card" : "notes";

      if (fromCode === "INR") {
        balances[toCode][srcField] += p.toAmount;
        balances[toCode].inrCost += p.fromAmount;
      } else if (toCode === "INR") {
        const bal = balances[fromCode];
        const totalBal = bal.notes + bal.card;
        if (totalBal > 0) {
          const proportion = p.fromAmount / totalBal;
          bal.inrCost *= 1 - proportion;
        }
        bal[srcField] -= p.fromAmount;
      } else {
        const fromBal = balances[fromCode];
        const fromTotal = fromBal.notes + fromBal.card;
        if (fromTotal > 0) {
          const proportion = p.fromAmount / fromTotal;
          const transferred = fromBal.inrCost * proportion;
          fromBal.inrCost -= transferred;
          balances[toCode].inrCost += transferred;
        }
        fromBal[srcField] -= p.fromAmount;
        balances[toCode][srcField] += p.toAmount;
      }
    } else {
      const e = event.data;
      const code = e.currency;
      ensureCurrency(code);
      const bal = balances[code];
      const totalBal = bal.notes + bal.card;
      if (totalBal > 0) {
        const proportion = e.amount / totalBal;
        bal.inrCost *= 1 - proportion;
      }
      const srcField =
        e.currencySource === "card" ? "card" : "notes";
      bal[srcField] -= e.amount;
    }
  }

  const result: ForexCurrencyBalance[] = [];
  for (const [currency, bal] of Object.entries(balances)) {
    if (currency === "INR") continue;
    const totalBalance = bal.notes + bal.card;
    result.push({
      currency,
      notesBalance: bal.notes,
      cardBalance: bal.card,
      totalBalance,
      inrCost: bal.inrCost,
      cumulativeRate: totalBalance > 0 ? bal.inrCost / totalBalance : 0,
    });
  }
  return result;
}

export async function getForexTransactionHistory(
  tripId: string,
  userId: string
): Promise<ForexTransaction[]> {
  const [purchases, expenseList] = await Promise.all([
    db
      .select()
      .from(currencyPurchases)
      .where(
        and(
          eq(currencyPurchases.tripId, tripId),
          eq(currencyPurchases.userId, userId)
        )
      ),
    db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.tripId, tripId),
          eq(expenses.userId, userId),
          ne(expenses.currency, "INR")
        )
      ),
  ]);

  const transactions: ForexTransaction[] = [
    ...purchases.map((p) => ({
      id: p.id,
      date: p.date,
      createdAt: p.createdAt,
      type: (p.type === "sell" ? "sell" : "buy") as "buy" | "sell",
      source: p.source,
      fromCurrency: p.fromCurrency,
      toCurrency: p.toCurrency,
      fromAmount: p.fromAmount,
      toAmount: p.toAmount,
      description: p.notes || "",
    })),
    ...expenseList.map((e) => ({
      id: e.id,
      date: e.date,
      createdAt: e.createdAt,
      type: "expense" as const,
      source: e.currencySource || "notes",
      fromCurrency: e.currency,
      toCurrency: "INR",
      fromAmount: e.amount,
      toAmount: e.amountInr,
      description: e.description,
    })),
  ];

  transactions.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return transactions;
}

export async function getAvailableCurrencies(
  tripId: string,
  userId: string
): Promise<string[]> {
  const balances = await getForexBalancesAndRates(tripId, userId);
  return balances
    .filter((b) => b.totalBalance > 0)
    .map((b) => b.currency);
}

// ── EZ-Link Queries ──

export async function getEzLinkTransactionsForTrip(
  tripId: string,
  userId: string
): Promise<EzLinkTransaction[]> {
  return db
    .select()
    .from(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.tripId, tripId),
        eq(ezlinkTransactions.userId, userId)
      )
    )
    .orderBy(desc(ezlinkTransactions.date), desc(ezlinkTransactions.createdAt));
}

export async function getEzLinkTransactionById(
  id: string,
  userId: string
): Promise<EzLinkTransaction | undefined> {
  const rows = await db
    .select()
    .from(ezlinkTransactions)
    .where(
      and(eq(ezlinkTransactions.id, id), eq(ezlinkTransactions.userId, userId))
    );
  return rows[0];
}

export type EzLinkBalance = {
  balanceSgd: number;
  inrCost: number;
  cumulativeRate: number;
  totalToppedUpSgd: number;
  totalToppedUpInr: number;
  totalSpentSgd: number;
  totalSpentInr: number;
};

export async function getEzLinkBalance(
  tripId: string,
  userId: string
): Promise<EzLinkBalance> {
  const rows = await db
    .select()
    .from(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.tripId, tripId),
        eq(ezlinkTransactions.userId, userId)
      )
    )
    .orderBy(ezlinkTransactions.date, ezlinkTransactions.createdAt);

  let balanceSgd = 0;
  let inrCost = 0;
  let totalToppedUpSgd = 0;
  let totalToppedUpInr = 0;
  let totalSpentSgd = 0;
  let totalSpentInr = 0;

  for (const tx of rows) {
    if (tx.type === "topup") {
      balanceSgd += tx.amountSgd;
      inrCost += tx.amountInr;
      totalToppedUpSgd += tx.amountSgd;
      totalToppedUpInr += tx.amountInr;
    } else {
      if (balanceSgd > 0) {
        const proportion = tx.amountSgd / balanceSgd;
        inrCost *= 1 - proportion;
      }
      balanceSgd -= tx.amountSgd;
      totalSpentSgd += tx.amountSgd;
      totalSpentInr += tx.amountInr;
    }
  }

  const cumulativeRate =
    balanceSgd > 0
      ? inrCost / balanceSgd
      : totalToppedUpSgd > 0
        ? totalToppedUpInr / totalToppedUpSgd
        : 0;

  return {
    balanceSgd,
    inrCost,
    cumulativeRate,
    totalToppedUpSgd,
    totalToppedUpInr,
    totalSpentSgd,
    totalSpentInr,
  };
}

export async function getEzLinkSpendTotal(
  tripId: string,
  userId: string
): Promise<number> {
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${ezlinkTransactions.amountInr}), 0)`,
    })
    .from(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.tripId, tripId),
        eq(ezlinkTransactions.userId, userId),
        eq(ezlinkTransactions.type, "spend")
      )
    );
  return rows[0]?.total ?? 0;
}

export async function getEzLinkSpendTotalForUser(
  userId: string
): Promise<number> {
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${ezlinkTransactions.amountInr}), 0)`,
    })
    .from(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.userId, userId),
        eq(ezlinkTransactions.type, "spend")
      )
    );
  return rows[0]?.total ?? 0;
}

export async function getEzLinkSpendTotalsByTrip(
  userId: string
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      tripId: ezlinkTransactions.tripId,
      total: sql<number>`coalesce(sum(${ezlinkTransactions.amountInr}), 0)`,
    })
    .from(ezlinkTransactions)
    .where(
      and(
        eq(ezlinkTransactions.userId, userId),
        eq(ezlinkTransactions.type, "spend")
      )
    )
    .groupBy(ezlinkTransactions.tripId);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.tripId] = row.total;
  }
  return result;
}
