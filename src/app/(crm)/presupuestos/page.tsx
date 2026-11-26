import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { quoteStatus } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { formatEur } from "@/lib/money";
import { documentTotals } from "@/lib/totals";
import { listQuotes } from "./queries";
import { QuoteStatusFilter } from "./quote-status-filter";

export const metadata: Metadata = { title: "Presupuestos · crm-demo" };

type SearchParams = Promise<{ estado?: string | string[] }>;

export default function QuotesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageHeader
        title="Presupuestos"
        actions={
          <ButtonLink href="/presupuestos/nuevo" data-testid="new-quote-button">
            Nuevo presupuesto
          </ButtonLink>
        }
      />
      <Suspense fallback={<Loading />}>
        <QuotesContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function QuotesContent({ searchParams }: { searchParams: SearchParams }) {
  const { estado } = await searchParams;
  // Read the database at request time, never at build time.
  await connection();
  const status = quoteStatus.enumValues.find((value) => value === estado);
  const quotes = await listQuotes(status);
  return (
    <>
      <div className="mb-4">
        <QuoteStatusFilter value={status ?? ""} />
      </div>
      <Table data-testid="quotes-table">
        <thead>
          <tr>
            <Th>Número</Th>
            <Th>Cliente</Th>
            <Th className="hidden sm:table-cell">Fecha</Th>
            <Th className="text-right">Total</Th>
            <Th>Estado</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {quotes.length === 0 && (
            <EmptyRow colSpan={5}>Todavía no hay presupuestos.</EmptyRow>
          )}
          {quotes.map((quote) => (
            <Tr key={quote.id} data-testid="quote-row" data-id={quote.id}>
              <Td className="whitespace-nowrap">
                <Link
                  href={`/presupuestos/${quote.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {quote.number}
                </Link>
              </Td>
              <Td>{quote.client.name}</Td>
              <Td className="hidden whitespace-nowrap sm:table-cell">
                {formatDate(quote.issuedAt)}
              </Td>
              <Td className="text-right whitespace-nowrap">
                {formatEur(documentTotals(quote.items).total)}
              </Td>
              <Td>
                <StatusBadge kind="quote" status={quote.status} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
