import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button, ButtonLink } from "@/components/button";
import { LineItemsTable } from "@/components/line-items-table";
import { DetailList, Loading, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { quoteStatus } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { parseId } from "@/lib/ids";
import { quoteStatusLabels } from "@/lib/status";
import { generateInvoice } from "../../facturas/actions";
import { changeQuoteStatus, duplicateQuote } from "../actions";
import { getQuote } from "../queries";

export default function QuoteDetailPage({
  params,
}: PageProps<"/presupuestos/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <QuoteDetail params={params} />
    </Suspense>
  );
}

async function QuoteDetail({
  params,
}: {
  params: PageProps<"/presupuestos/[id]">["params"];
}) {
  const id = parseId((await params).id);
  const quote = id ? await getQuote(id) : null;
  if (!quote) notFound();

  return (
    <>
      <PageHeader
        title={`Presupuesto ${quote.number}`}
        description={<StatusBadge kind="quote" status={quote.status} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <form action={duplicateQuote.bind(null, quote.id)}>
              <Button
                type="submit"
                variant="secondary"
                data-testid="duplicate-quote-button"
              >
                Duplicar
              </Button>
            </form>
            {quote.invoice ? (
              <ButtonLink
                href={`/facturas/${quote.invoice.id}`}
                variant="secondary"
                data-testid="view-invoice-button"
              >
                Ver factura {quote.invoice.number}
              </ButtonLink>
            ) : quote.status === "accepted" ? (
              <form action={generateInvoice.bind(null, quote.id)}>
                <Button type="submit" data-testid="generate-invoice-button">
                  Generar factura
                </Button>
              </form>
            ) : null}
          </div>
        }
      />
      <div className="space-y-8" data-testid="quote-detail">
        <DetailList
          items={[
            {
              label: "Cliente",
              value: (
                <Link
                  href={`/clientes/${quote.client.id}`}
                  className="text-blue-700 hover:underline"
                >
                  {quote.client.name}
                </Link>
              ),
              testId: "quote-client",
            },
            {
              label: "Fecha",
              value: formatDate(quote.issuedAt),
              testId: "quote-issued-at",
            },
            { label: "Notas", value: quote.notes, testId: "quote-notes" },
          ]}
        />

        <section>
          <h2 className="mb-3 text-lg font-semibold">Líneas</h2>
          <LineItemsTable items={quote.items} />
        </section>

        {!quote.invoice && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Estado</h2>
            <form
              key={quote.status}
              action={changeQuoteStatus.bind(null, quote.id)}
              className="flex flex-wrap items-center gap-2"
              data-testid="quote-status-form"
            >
              <label className="sr-only" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={quote.status}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                data-testid="field-status"
              >
                {quoteStatus.enumValues.map((status) => (
                  <option key={status} value={status}>
                    {quoteStatusLabels[status]}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                variant="secondary"
                data-testid="change-status-button"
              >
                Cambiar estado
              </Button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
