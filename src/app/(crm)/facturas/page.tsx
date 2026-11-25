import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { formatDate, isOverdue, todayIso } from "@/lib/dates";
import { formatEur } from "@/lib/money";
import { documentTotals } from "@/lib/totals";
import type { InvoiceStatus } from "@/db/schema";
import { InvoiceStatusFilter } from "./invoice-status-filter";
import { listInvoices } from "./queries";

export const metadata: Metadata = { title: "Facturas · crm-demo" };

export default function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  return (
    <>
      <PageHeader
        title="Facturas"
        description="Las facturas se generan desde un presupuesto aceptado."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Suspense fallback={null}>
              <InvoiceStatusFilter />
            </Suspense>
          </div>
        }
      />
      <Suspense fallback={<Loading />}>
        <InvoicesTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function InvoicesTable({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const status =
    estado === "pending" || estado === "paid"
      ? (estado as InvoiceStatus)
      : undefined;

  // Read the database at request time, never at build time.
  await connection();
  const invoices = await listInvoices(status);
  const today = todayIso();
  return (
    <Table data-testid="invoices-table">
      <thead>
        <tr>
          <Th>Número</Th>
          <Th>Cliente</Th>
          <Th className="hidden sm:table-cell">Emisión</Th>
          <Th className="hidden sm:table-cell">Vencimiento</Th>
          <Th className="text-right">Total</Th>
          <Th>Estado</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {invoices.length === 0 && (
          <EmptyRow colSpan={6}>Todavía no hay facturas.</EmptyRow>
        )}
        {invoices.map((invoice) => {
          const overdue = isOverdue(invoice.dueAt, invoice.status, today);
          return (
            <Tr
              key={invoice.id}
              data-testid="invoice-row"
              data-id={invoice.id}
              data-overdue={overdue ? "true" : undefined}
              className={overdue ? "bg-red-50" : ""}
            >
              <Td className="whitespace-nowrap">
                <Link
                  href={`/facturas/${invoice.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {invoice.number}
                </Link>
                {overdue && (
                  <span
                    data-testid="overdue-badge"
                    className="ml-2 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-red-700 sm:hidden"
                  >
                    Vencida
                  </span>
                )}
              </Td>
              <Td>{invoice.client.name}</Td>
              <Td className="hidden whitespace-nowrap sm:table-cell">
                {formatDate(invoice.issuedAt)}
              </Td>
              <Td className="hidden sm:table-cell">
                <span className="whitespace-nowrap">
                  {formatDate(invoice.dueAt)}
                </span>
                {overdue && (
                  <span
                    data-testid="overdue-badge"
                    className="ml-2 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-red-700"
                  >
                    Vencida
                  </span>
                )}
              </Td>
              <Td className="text-right whitespace-nowrap">
                {formatEur(documentTotals(invoice.items).total)}
              </Td>
              <Td>
                <StatusBadge kind="invoice" status={invoice.status} />
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
