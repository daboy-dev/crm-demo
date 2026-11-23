import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { formatDate } from "@/lib/dates";
import { formatEur } from "@/lib/money";
import { documentTotals } from "@/lib/totals";
import { listInvoices } from "./queries";

export const metadata: Metadata = { title: "Facturas · crm-demo" };

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Facturas"
        description="Las facturas se generan desde un presupuesto aceptado."
      />
      <Suspense fallback={<Loading />}>
        <InvoicesTable />
      </Suspense>
    </>
  );
}

async function InvoicesTable() {
  // Read the database at request time, never at build time.
  await connection();
  const invoices = await listInvoices();
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
        {invoices.map((invoice) => (
          <Tr key={invoice.id} data-testid="invoice-row" data-id={invoice.id}>
            <Td className="whitespace-nowrap">
              <Link
                href={`/facturas/${invoice.id}`}
                className="font-medium text-blue-700 hover:underline"
              >
                {invoice.number}
              </Link>
            </Td>
            <Td>{invoice.client.name}</Td>
            <Td className="hidden whitespace-nowrap sm:table-cell">
              {formatDate(invoice.issuedAt)}
            </Td>
            <Td className="hidden whitespace-nowrap sm:table-cell">
              {formatDate(invoice.dueAt)}
            </Td>
            <Td className="text-right whitespace-nowrap">
              {formatEur(documentTotals(invoice.items).total)}
            </Td>
            <Td>
              <StatusBadge kind="invoice" status={invoice.status} />
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
