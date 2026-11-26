import { count, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { clients, invoices, quotes } from "@/db/schema";
import { lineTotals } from "@/lib/totals";

export async function getSummaryMetrics() {
  const db = getDb();
  const [clientCountRes] = await db.select({ count: count() }).from(clients);
  const [sentQuotesCountRes] = await db
    .select({ count: count() })
    .from(quotes)
    .where(eq(quotes.status, "sent"));

  const pendingInvoices = await db.query.invoices.findMany({
    where: eq(invoices.status, "pending"),
    with: {
      items: true,
    },
  });

  let pendingAmount = 0;
  for (const inv of pendingInvoices) {
    for (const item of inv.items) {
      pendingAmount += lineTotals(item).total;
    }
  }

  return {
    clientsCount: clientCountRes?.count ?? 0,
    sentQuotesCount: sentQuotesCountRes?.count ?? 0,
    pendingAmount,
  };
}
