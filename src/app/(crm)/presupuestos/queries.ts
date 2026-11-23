import { desc, eq, like } from "drizzle-orm";
import { getDb } from "@/db/client";
import { quotes } from "@/db/schema";

/** All quotes, newest first, with client and lines (to compute totals). */
export async function listQuotes() {
  return getDb().query.quotes.findMany({
    orderBy: [desc(quotes.issuedAt), desc(quotes.id)],
    with: {
      client: { columns: { id: true, name: true } },
      items: true,
    },
  });
}

/** One quote with its client, lines and the invoice generated from it. */
export async function getQuote(id: number) {
  const quote = await getDb().query.quotes.findFirst({
    where: eq(quotes.id, id),
    with: {
      client: true,
      items: { orderBy: (items, { asc }) => [asc(items.id)] },
      invoice: { columns: { id: true, number: true } },
    },
  });
  return quote ?? null;
}

/** Existing quote numbers of a year, e.g. for "P-2026-…". */
export async function listQuoteNumbers(year: number) {
  const rows = await getDb()
    .select({ number: quotes.number })
    .from(quotes)
    .where(like(quotes.number, `P-${year}-%`));
  return rows.map((row) => row.number);
}
