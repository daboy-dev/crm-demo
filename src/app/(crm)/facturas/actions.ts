"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { uniqueViolation } from "@/db/errors";
import { invoices } from "@/db/schema";
import { addDays, todayIso } from "@/lib/dates";
import { nextDocumentNumber } from "@/lib/numbering";
import { getInvoiceIdForQuote, listInvoiceNumbers } from "./queries";

/** Days until an invoice is due. */
const PAYMENT_TERM_DAYS = 30;
const MAX_NUMBER_ATTEMPTS = 3;

/**
 * Creates the invoice for an accepted quote, copying its lines. Safe to call
 * twice: a quote has at most one invoice, so a repeat goes to the existing one.
 */
export async function generateInvoice(quoteId: number): Promise<void> {
  const issuedAt = todayIso();
  const dueAt = addDays(issuedAt, PAYMENT_TERM_DAYS);
  const year = Number(issuedAt.slice(0, 4));

  let invoiceId = await getInvoiceIdForQuote(quoteId);
  for (let attempt = 1; invoiceId === null; attempt++) {
    const number = nextDocumentNumber(
      "F",
      year,
      await listInvoiceNumbers(year),
    );
    try {
      invoiceId = await insertInvoiceFromQuote(
        quoteId,
        number,
        issuedAt,
        dueAt,
      );
      if (invoiceId === null) {
        throw new Error("Solo se puede facturar un presupuesto aceptado.");
      }
    } catch (error) {
      const constraint = uniqueViolation(error);
      if (constraint === "invoices_quote_id_unique") {
        invoiceId = await getInvoiceIdForQuote(quoteId);
      } else if (
        constraint !== "invoices_number_unique" ||
        attempt >= MAX_NUMBER_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  revalidatePath("/facturas");
  revalidatePath(`/presupuestos/${quoteId}`);
  redirect(`/facturas/${invoiceId}`);
}

/**
 * Inserts the invoice and copies the quote lines in one statement (atomic).
 * Returns null if the quote does not exist or is not accepted.
 */
async function insertInvoiceFromQuote(
  quoteId: number,
  number: string,
  issuedAt: string,
  dueAt: string,
): Promise<number | null> {
  const result = await getDb().execute<{ id: number }>(sql`
    with new_invoice as (
      insert into invoices (number, quote_id, client_id, status, issued_at, due_at)
      select ${number}, q.id, q.client_id, 'pending', ${issuedAt}, ${dueAt}
      from quotes q
      where q.id = ${quoteId} and q.status = 'accepted'
      returning id, quote_id
    ), new_items as (
      insert into invoice_items (invoice_id, description, quantity, unit_price, tax_rate)
      select new_invoice.id, qi.description, qi.quantity, qi.unit_price, qi.tax_rate
      from new_invoice
      join quote_items qi on qi.quote_id = new_invoice.quote_id
    )
    select id from new_invoice
  `);
  const row = result.rows[0];
  return row ? Number(row.id) : null;
}

export async function markInvoicePaid(id: number): Promise<void> {
  await getDb()
    .update(invoices)
    .set({ status: "paid" })
    .where(and(eq(invoices.id, id), eq(invoices.status, "pending")));
  revalidatePath("/facturas");
  revalidatePath(`/facturas/${id}`);
}
