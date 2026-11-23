import type { InvoiceStatus, QuoteStatus } from "@/db/schema";
import { invoiceStatusLabels, quoteStatusLabels } from "@/lib/status";

const colors: Record<QuoteStatus | InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
};

type Props =
  | { kind: "quote"; status: QuoteStatus }
  | { kind: "invoice"; status: InvoiceStatus };

export function StatusBadge(props: Props) {
  const label =
    props.kind === "quote"
      ? quoteStatusLabels[props.status]
      : invoiceStatusLabels[props.status];
  return (
    <span
      data-testid="status-badge"
      data-status={props.status}
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${colors[props.status]}`}
    >
      {label}
    </span>
  );
}
