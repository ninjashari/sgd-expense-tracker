import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  foreignCurrency: text("foreign_currency"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  amountInr: real("amount_inr").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  paidBy: text("paid_by"),
  currencySource: text("currency_source"),
  type: text("type").notNull().default("expense"),
  // Not a real FK: only used for UI routing (return rows link back to the
  // ezlinkTransactions row that created them), and a genuine reference here
  // would form a circular FK with ezlinkTransactions.linkedExpenseId that
  // can't be satisfied by sequential inserts.
  linkedEzlinkTransactionId: text("linked_ezlink_transaction_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const currencyPurchases = sqliteTable("currency_purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  type: text("type").notNull(),
  source: text("source").notNull(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  fromAmount: real("from_amount").notNull(),
  toAmount: real("to_amount").notNull(),
  rate: real("rate").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const ezlinkTransactions = sqliteTable("ezlink_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  type: text("type").notNull(),
  amountSgd: real("amount_sgd").notNull(),
  amountInr: real("amount_inr").notNull(),
  category: text("category"),
  linkedPurchaseId: text("linked_purchase_id").references(
    () => currencyPurchases.id
  ),
  linkedExpenseId: text("linked_expense_id").references(() => expenses.id),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type CategoryRecord = typeof categories.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type CurrencyPurchase = typeof currencyPurchases.$inferSelect;
export type EzLinkTransaction = typeof ezlinkTransactions.$inferSelect;
