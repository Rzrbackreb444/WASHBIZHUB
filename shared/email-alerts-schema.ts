import { pgTable, varchar, timestamp, decimal, boolean, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Price alert subscriptions
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email").notNull(),
  productASIN: varchar("product_asin").notNull(),
  productTitle: varchar("product_title").notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  alertSent: boolean("alert_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastChecked: timestamp("last_checked"),
});

// Back-in-stock alerts
export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email").notNull(),
  productASIN: varchar("product_asin").notNull(),
  productTitle: varchar("product_title").notNull(),
  alertSent: boolean("alert_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New product alerts by category
export const newProductAlerts = pgTable("new_product_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email").notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deal alerts
export const dealAlerts = pgTable("deal_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email").notNull(),
  minDiscount: decimal("min_discount", { precision: 5, scale: 2 }).default('10.00'),
  categories: text("categories"), // JSON array of categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Browse abandonment tracking
export const browseAbandonment = pgTable("browse_abandonment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  email: varchar("email"),
  productASINs: text("product_asins").notNull(), // JSON array
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
});

// Zod schemas
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true });
export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({ id: true, createdAt: true });
export const insertNewProductAlertSchema = createInsertSchema(newProductAlerts).omit({ id: true, createdAt: true });
export const insertDealAlertSchema = createInsertSchema(dealAlerts).omit({ id: true, createdAt: true });

export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type InsertNewProductAlert = z.infer<typeof insertNewProductAlertSchema>;
export type InsertDealAlert = z.infer<typeof insertDealAlertSchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type StockAlert = typeof stockAlerts.$inferSelect;
export type NewProductAlert = typeof newProductAlerts.$inferSelect;
export type DealAlert = typeof dealAlerts.$inferSelect;
