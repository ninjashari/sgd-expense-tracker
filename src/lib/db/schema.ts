import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
});

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  amountInr: real("amount_inr").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  paidBy: text("paid_by"),
  createdAt: text("created_at").notNull(),
  tripId: text("trip_id").references(() => trips.id),
  updatedAt: text("updated_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
