"use server";

import { and, eq, notExists, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { uniqueViolation } from "@/db/errors";
import { invoices, quotes } from "@/db/schema";
import { todayIso } from "@/lib/dates";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";
import { nextDocumentNumber } from "@/lib/numbering";
import { getQuote, listQuoteNumbers } from "./queries";
import {
  quoteFields,
  quoteSchema,
  readItems,
  statusSchema,
  type QuoteInput,
} from "./validation";

const MAX_NUMBER_ATTEMPTS = 3;

export async function createQuote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, quoteFields);
  const parsed = quoteSchema.safeParse({
    ...values,
    items: readItems(formData),
  });
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  const id = await insertQuoteWithNumber(parsed.data);
  revalidatePath("/presupuestos");
  redirect(`/presupuestos/${id}`);
}

export async function duplicateQuote(id: number): Promise<void> {
  const existing = await getQuote(id);
  if (!existing) throw new Error("Quote not found");

  const input: QuoteInput = {
    clientId: existing.clientId,
    issuedAt: todayIso(),
    notes: existing.notes,
    items: existing.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })),
  };

  const newId = await insertQuoteWithNumber(input);
  revalidatePath("/presupuestos");
  redirect(`/presupuestos/${newId}`);
}

/**
 * Inserts the quote and its lines in one statement (atomic), numbering it
 * P-YYYY-NNN. If another request took the same number, retries.
 */
async function insertQuoteWithNumber(input: QuoteInput): Promise<number> {
  const year = Number(input.issuedAt.slice(0, 4));
  for (let attempt = 1; ; attempt++) {
    const number = nextDocumentNumber("P", year, await listQuoteNumbers(year));
    try {
      return await insertQuote(input, number);
    } catch (error) {
      const retry =
        uniqueViolation(error) === "quotes_number_unique" &&
        attempt < MAX_NUMBER_ATTEMPTS;
      if (!retry) throw error;
    }
  }
}

async function insertQuote(input: QuoteInput, number: string) {
  const lines = sql.join(
    input.items.map(
      (item) =>
        sql`(${item.description}::text, ${item.quantity}::integer, ${item.unitPrice}::integer, ${item.taxRate}::integer)`,
    ),
    sql`, `,
  );
  const result = await getDb().execute<{ id: number }>(sql`
    with new_quote as (
      insert into quotes (number, client_id, status, issued_at, notes)
      values (${number}, ${input.clientId}, 'draft', ${input.issuedAt}, ${input.notes})
      returning id
    ), new_items as (
      insert into quote_items (quote_id, description, quantity, unit_price, tax_rate)
      select new_quote.id, line.description, line.quantity, line.unit_price, line.tax_rate
      from new_quote, (values ${lines}) as line(description, quantity, unit_price, tax_rate)
    )
    select id from new_quote
  `);
  const row = result.rows[0];
  if (!row) throw new Error("Quote insert returned no row");
  return Number(row.id);
}

/** Changes the status unless an invoice was already generated from it. */
export async function changeQuoteStatus(
  id: number,
  formData: FormData,
): Promise<void> {
  const status = statusSchema.parse(formData.get("status"));
  await getDb()
    .update(quotes)
    .set({ status })
    .where(
      and(
        eq(quotes.id, id),
        notExists(
          getDb()
            .select({ id: invoices.id })
            .from(invoices)
            .where(eq(invoices.quoteId, id)),
        ),
      ),
    );
  revalidatePath("/presupuestos");
  revalidatePath(`/presupuestos/${id}`);
}
