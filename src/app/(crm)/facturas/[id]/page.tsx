import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/button";
import { LineItemsTable } from "@/components/line-items-table";
import { DetailList, Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/dates";
import { parseId } from "@/lib/ids";
import { markInvoicePaid } from "../actions";
import { getInvoice } from "../queries";

export default function InvoiceDetailPage({
  params,
}: PageProps<"/facturas/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <InvoiceDetail params={params} />
    </Suspense>
  );
}

async function InvoiceDetail({
  params,
}: {
  params: PageProps<"/facturas/[id]">["params"];
}) {
  const id = parseId((await params).id);
  const invoice = id ? await getInvoice(id) : null;
  if (!invoice) notFound();

  return (
    <>
      <PageHeader
        title={`Factura ${invoice.number}`}
        description={<StatusBadge kind="invoice" status={invoice.status} />}
        actions={
          invoice.status === "pending" && (
            <form action={markInvoicePaid.bind(null, invoice.id)}>
              <Button type="submit" data-testid="mark-paid-button">
                Marcar como pagada
              </Button>
            </form>
          )
        }
      />
      <div className="space-y-8" data-testid="invoice-detail">
        <DetailList
          items={[
            {
              label: "Cliente",
              value: (
                <Link
                  href={`/clientes/${invoice.client.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {invoice.client.name}
                </Link>
              ),
              testId: "invoice-client",
            },
            {
              label: "Presupuesto",
              value: (
                <Link
                  href={`/presupuestos/${invoice.quote.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {invoice.quote.number}
                </Link>
              ),
              testId: "invoice-quote",
            },
            {
              label: "Emisión",
              value: formatDate(invoice.issuedAt),
              testId: "invoice-issued-at",
            },
            {
              label: "Vencimiento",
              value: formatDate(invoice.dueAt),
              testId: "invoice-due-at",
            },
          ]}
        />
        <section>
          <h2 className="mb-3 text-lg font-semibold">Líneas</h2>
          <LineItemsTable items={invoice.items} />
        </section>
      </div>
    </>
  );
}
