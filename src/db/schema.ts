import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const quoteStatus = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
]);

export const invoiceStatus = pgEnum("invoice_status", ["pending", "paid"]);

export type QuoteStatus = (typeof quoteStatus.enumValues)[number];
export type InvoiceStatus = (typeof invoiceStatus.enumValues)[number];

export const clients = pgTable("clients", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text(),
  company: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  /** Format `P-YYYY-NNN`, see `src/lib/numbering.ts`. */
  number: text().notNull().unique(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  status: quoteStatus().notNull().default("draft"),
  /** Calendar date, `YYYY-MM-DD`. */
  issuedAt: date("issued_at").notNull(),
  notes: text(),
});

export const quoteItems = pgTable("quote_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quoteId: integer("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  description: text().notNull(),
  quantity: integer().notNull(),
  /** Euro cents. */
  unitPrice: integer("unit_price").notNull(),
  /** Whole percentage, e.g. 21 for 21 % IVA. */
  taxRate: integer("tax_rate").notNull(),
});

export const invoices = pgTable("invoices", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  /** Format `F-YYYY-NNN`, see `src/lib/numbering.ts`. */
  number: text().notNull().unique(),
  /** One invoice per quote at most. */
  quoteId: integer("quote_id")
    .notNull()
    .unique()
    .references(() => quotes.id),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  status: invoiceStatus().notNull().default("pending"),
  /** Calendar date, `YYYY-MM-DD`. */
  issuedAt: date("issued_at").notNull(),
  /** Calendar date, `YYYY-MM-DD`. */
  dueAt: date("due_at").notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text().notNull(),
  quantity: integer().notNull(),
  /** Euro cents. */
  unitPrice: integer("unit_price").notNull(),
  /** Whole percentage, e.g. 21 for 21 % IVA. */
  taxRate: integer("tax_rate").notNull(),
});

export type Client = typeof clients.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
