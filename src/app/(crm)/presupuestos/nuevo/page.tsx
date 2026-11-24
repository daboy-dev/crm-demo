import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetOnHide } from "@/components/reset-on-hide";
import { Loading, PageHeader } from "@/components/page-header";
import { todayIso } from "@/lib/dates";
import { listClientOptions } from "../../clientes/queries";
import { createQuote } from "../actions";
import { QuoteForm } from "../quote-form";

export const metadata: Metadata = { title: "Nuevo presupuesto · crm-demo" };

export default function NewQuotePage({
  searchParams,
}: PageProps<"/presupuestos/nuevo">) {
  return (
    <>
      <PageHeader title="Nuevo presupuesto" />
      <Suspense fallback={<Loading />}>
        <NewQuote searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewQuote({
  searchParams,
}: {
  searchParams: PageProps<"/presupuestos/nuevo">["searchParams"];
}) {
  const { cliente } = await searchParams;
  const clients = await listClientOptions();
  return (
    <ResetOnHide>
      <QuoteForm
        action={createQuote}
        clients={clients}
        defaultClientId={typeof cliente === "string" ? cliente : undefined}
        defaultIssuedAt={todayIso()}
      />
    </ResetOnHide>
  );
}
