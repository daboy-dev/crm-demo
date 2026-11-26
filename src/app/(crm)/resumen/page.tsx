import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Loading, PageHeader } from "@/components/page-header";
import { formatEur } from "@/lib/money";
import { getSummaryMetrics } from "./queries";

export const metadata: Metadata = { title: "Resumen · crm-demo" };

export default function SummaryPage() {
  return (
    <>
      <PageHeader
        title="Resumen"
        description="Métricas generales de clientes, presupuestos y facturación."
      />
      <Suspense fallback={<Loading />}>
        <SummaryContent />
      </Suspense>
    </>
  );
}

async function SummaryContent() {
  await connection();
  const metrics = await getSummaryMetrics();

  return (
    <div
      data-testid="summary-detail-simulated"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-medium text-slate-500">Clientes</h3>
        <p
          data-testid="clients-count"
          className="mt-2 text-3xl font-semibold text-slate-900"
        >
          {metrics.clientsCount}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-medium text-slate-500">
          Presupuestos enviados
        </h3>
        <p
          data-testid="sent-quotes-count"
          className="mt-2 text-3xl font-semibold text-slate-900"
        >
          {metrics.sentQuotesCount}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-medium text-slate-500">
          Importe pendiente
        </h3>
        <p
          data-testid="pending-amount"
          className="mt-2 text-3xl font-semibold text-slate-900"
        >
          {formatEur(metrics.pendingAmount)}
        </p>
      </div>
    </div>
  );
}
