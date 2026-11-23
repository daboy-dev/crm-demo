import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { DetailList, Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyRow, Table, Td, Th, Tr } from "@/components/table";
import { formatDate } from "@/lib/dates";
import { parseId } from "@/lib/ids";
import { getClientWithDocuments } from "../queries";

export default function ClientDetailPage({
  params,
}: PageProps<"/clientes/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <ClientDetail params={params} />
    </Suspense>
  );
}

async function ClientDetail({
  params,
}: {
  params: PageProps<"/clientes/[id]">["params"];
}) {
  const id = parseId((await params).id);
  const client = id ? await getClientWithDocuments(id) : null;
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.name}
        description={client.company}
        actions={
          <>
            <ButtonLink
              href={`/presupuestos/nuevo?cliente=${client.id}`}
              variant="secondary"
              data-testid="new-quote-for-client-button"
            >
              Nuevo presupuesto
            </ButtonLink>
            <ButtonLink
              href={`/clientes/${client.id}/editar`}
              data-testid="edit-client-button"
            >
              Editar
            </ButtonLink>
          </>
        }
      />
      <div className="space-y-8" data-testid="client-detail">
        <DetailList
          items={[
            { label: "Email", value: client.email, testId: "client-email" },
            { label: "Teléfono", value: client.phone, testId: "client-phone" },
            {
              label: "Empresa",
              value: client.company,
              testId: "client-company",
            },
            {
              label: "Alta",
              value: formatDate(client.createdAt.toISOString().slice(0, 10)),
            },
          ]}
        />

        <section>
          <h2 className="mb-3 text-lg font-semibold">Presupuestos</h2>
          <Table data-testid="client-quotes-table">
            <thead>
              <tr>
                <Th>Número</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {client.quotes.length === 0 && (
                <EmptyRow colSpan={3}>Sin presupuestos.</EmptyRow>
              )}
              {client.quotes.map((quote) => (
                <Tr key={quote.id} data-testid="quote-row" data-id={quote.id}>
                  <Td>
                    <Link
                      href={`/presupuestos/${quote.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {quote.number}
                    </Link>
                  </Td>
                  <Td>{formatDate(quote.issuedAt)}</Td>
                  <Td>
                    <StatusBadge kind="quote" status={quote.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Facturas</h2>
          <Table data-testid="client-invoices-table">
            <thead>
              <tr>
                <Th>Número</Th>
                <Th>Vencimiento</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {client.invoices.length === 0 && (
                <EmptyRow colSpan={3}>Sin facturas.</EmptyRow>
              )}
              {client.invoices.map((invoice) => (
                <Tr
                  key={invoice.id}
                  data-testid="invoice-row"
                  data-id={invoice.id}
                >
                  <Td>
                    <Link
                      href={`/facturas/${invoice.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </Td>
                  <Td>{formatDate(invoice.dueAt)}</Td>
                  <Td>
                    <StatusBadge kind="invoice" status={invoice.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </>
  );
}
