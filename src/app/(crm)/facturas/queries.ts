import { desc, eq, like } from "drizzle-orm";
import { getDb } from "db/client";
import { invoices, InvoiceStatus } from "db/schema";

/** All invoices, newest first, with client and lines (to compute totals). */
export async function listInvoices(status?: InvoiceStatus) {
  return getDb().query.invoices.findMany({
    where: status ? eq(invoices.status, status) : undefined,
    orderBy: [desc(invoices.issuedAt), desc(invoices.id)],
    with: {
      client: { columns: { id: true, name: true } },
      items: true,
    },
  });
}

/** One invoice with its client, lines and source quote. */
export async function getInvoice(id: number) {
  const invoice = await getDb().query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: {
      client: true,
      quote: { columns: { id: true, number: true } },
      items: { orderBy: (items, { asc }) => [asc(items.id)] },
    },
  });
  return invoice ?? null;
}

export async function getInvoiceIdForQuote(quoteId: number) {
  const [row] = await getDb()
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.quoteId, quoteId));
  return row?.id ?? null;
}

/** Existing invoice numbers of a year, e.g. for "F-2026-…". */
export async function listInvoiceNumbers(year: number) {
  const rows = await getDb()
    .select({ number: invoices.number })
    .from(invoices)
    .where(like(invoices.number, `F-${year}-%`));
  return rows.map((row) => row.number);
}
